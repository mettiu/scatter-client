const { chunkUpload } = require('../config');
const fs = require('fs');
const Commander = require('../utils/commander');
const announceFileCommand = require('./announceFile');
const uploadChunkCommand = require('./uploadChunk');

const getChunkSplitInfo = fileSize => ({
  fileSize,
  chunkSize: chunkUpload.size,
  chunkNumber: Math.floor(fileSize / chunkUpload.size),
  lastChunkSize: fileSize % chunkUpload.size,
});

async function action(socket, filePath) {
  const fileStats = fs.statSync(filePath);
  const chunkInfo = getChunkSplitInfo(fileStats.size);

  // TODO: manage file announcement returned data (i.e.: no token...)
  const fileAnnouncement =
      await Commander.exec(announceFileCommand.name, socket, filePath, fileStats.size);

  const result = {
    saved: false,
    versioned: false,
    chunkInfo: null,
    filePath,
  };

  // if file was not saved (the file already exists and there is NO CHANGE), return
  if (fileAnnouncement.saved === false) {
    return new Promise((fulfill) => {
      fulfill(result);
    });
  }

  // open file for read
  const fd = fs.openSync(filePath, 'r');

  // read chunks one-by-one except for the latest one
  // and for each chunk call manageDataFunction
  const buffer = Buffer.alloc(chunkInfo.chunkSize);
  let i;

  const results = [];

  for (i = 0; i < chunkInfo.chunkNumber; i += 1) {
    fs.readSync(fd, buffer, 0, chunkInfo.chunkSize, null);
    results
      .push(Commander.exec(uploadChunkCommand.name, socket, buffer, i, fileAnnouncement.token));
  }
  if (chunkInfo.lastChunkSize !== 0) {
    // read the last (and smaller) chunk and upload it
    const lastBuffer = Buffer.alloc(chunkInfo.lastChunkSize);
    fs.readSync(fd, lastBuffer, 0, chunkInfo.lastChunkSize, null);
    results.push(Commander.exec(
      uploadChunkCommand.name, socket, lastBuffer,
      chunkInfo.chunkNumber - 1, fileAnnouncement.token,
    ));
  }

  await Promise.all(results);

  // close file
  fs.closeSync(fd);

  // return exit info, promisified! because this function is called with await
  result.versioned = fileAnnouncement.versioned;
  result.saved = fileAnnouncement.saved;
  result.chunkInfo = chunkInfo;
  return new Promise((fulfill) => {
    fulfill(result);
  });
}

function humanize(result) {
  // if file was not saved
  if (!result.saved) {
    return `File ${result.filePath} was not changed since last upload.`;
  }
  // if file was saved and was not versioned
  if (!result.versioned) {
    return `File ${result.filePath} was split in ${result.chunkInfo.chunkNumber + 1} chunks and uploaded.`;
  }
  // if file was saved as a new version
  return `New version of file ${result.filePath} was split in ${result.chunkInfo.chunkNumber + 1} chunks and uploaded'.`;
}

const command = {
  name: 'fileUpload',
  action,
  humanize,
};

Commander.createCommand(command);

module.exports = command;
