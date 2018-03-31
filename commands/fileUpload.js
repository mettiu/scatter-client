const cipher = require('../utils/cipher');
const { chunkUpload, fileUpload } = require('../config');
const encode = require('../utils/encode');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../utils/send-message');

const getChunkSplitInfo = fileSize => ({
  fileSize,
  chunkSize: chunkUpload.size,
  chunkNumber: Math.floor(fileSize / chunkUpload.size),
  lastChunkSize: fileSize % chunkUpload.size,
});

async function uploadChunk(socket, buffer, seq, token) {
  // crypt and then encode data chunk
  const data = {
    seq,
    token,
    buffer: encode.base64Encode(cipher.crypt(buffer)),
    chunkSize: buffer.length,
  };
  return sendMessage(socket, chunkUpload.message, data);
}

async function announceFile(socket, filePath, remotePath = '/') {
  const fileStats = fs.statSync(filePath);
  const data = {
    fileName: path.parse(filePath).base,
    size: fileStats.size,
    lastModified: Math.round(fileStats.mtimeMs),
    remotePath,
  };

  return JSON.parse(await sendMessage(socket, fileUpload.message, data));
}

async function uploadFile(socket, filePath) {
  // const filename = path.parse(filePath).base;
  const fileStats = fs.statSync(filePath);
  const chunkInfo = getChunkSplitInfo(fileStats.size);

  // TODO: manage file announcement returned data (i.e.: no token...)
  const fileAnnouncement =
      await announceFile(socket, filePath, fileStats.size);

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
    results.push(uploadChunk(socket, buffer, i, fileAnnouncement.token));
  }
  if (chunkInfo.lastChunkSize !== 0) {
    // read the last (and smaller) chunk and upload it
    const lastBuffer = Buffer.alloc(chunkInfo.lastChunkSize);
    fs.readSync(fd, lastBuffer, 0, chunkInfo.lastChunkSize, null);
    results.push(uploadChunk(
      socket, lastBuffer,
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

function stringifyUploadResult(result) {
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

exports.uploadFile = uploadFile;
exports.announceFile = announceFile;
exports.getChunkSplitInfo = getChunkSplitInfo;
exports.stringifyUploadResult = stringifyUploadResult;

