const cipher = require('./cipher');
const config = require('../config.js');
const encode = require('./encode');
const fs = require('fs');
const path = require('path');

function getChunkSplitInfo(fileSize) {
  const chunkSize = config.http.chunkUpload.size;
  return {
    fileSize,
    chunkSize,
    chunkNumber: Math.floor(fileSize / chunkSize),
    lastChunkSize: fileSize % chunkSize,
  };
}

// TODO: bring sendmessage function into its own module (used also in other modules!!
function sendMessage(socket, eventname, data) {
  return new Promise((resolve) => {
    socket.on('connect_timeout', () => console.log('error!'));
    socket.emit(eventname, data, ack => resolve(ack));
  });
}

async function uploadChunk(socket, buffer, seq, token) {
  // crypt and then encode data chunk
  const data = {
    seq,
    token,
    buffer: encode.base64Encode(cipher.crypt(buffer)),
    chunkSize: buffer.length,
  };
  return sendMessage(socket, 'chunk-upload', data);


  // const opts = {
  //   method: 'POST',
  //   body: {
  //     fileId,
  //     data,
  //     // size,
  //   },
  //   json: true,
  // };

  // let response;
  // try {
  //   response = await got(config.http.chunkUpload.uri, opts);
  // } catch (catched) {
  //   throw createError('Cannot upload chunk.', errors.ERR_HTTP_UPLOAD);
  // }
  // return response.body;
}

// TODO: user remote path (now it's not used!!)
async function announceFile(socket, filePath, remotePath = '/') {
  const fileStats = fs.statSync(filePath);
  const data = {
    fileName: path.parse(filePath).base,
    size: fileStats.size,
    lastModified: Math.round(fileStats.mtimeMs),
  };
  console.log(data);

  const ack = await sendMessage(socket, 'file-upload', data);
  console.log(JSON.parse(ack));
  return ack;
}
// TODO: manage unexistent file

async function uploadFile(socket, filePath, remotePath) {
  // const filename = path.parse(filePath).base;
  const fileStats = fs.statSync(filePath);
  const chunkInfo = getChunkSplitInfo(fileStats.size);

  // TODO: manage file announcement returned data (i.e.: no token...)
  const fileAnnouncement =
      JSON.parse(await announceFile(socket, filePath, remotePath, fileStats.size));
  // } catch (e) {
  //   throw createError(`Error while announcing file ${filename}.`, errors.ERR_HTTP_UPLOAD);
  // }

  // open file for read
  const fd = fs.openSync(filePath, 'r');

  // if file was not saved (the file already exists and there is NO CHANGE), return
  if (fileAnnouncement.saved === false) return;

  // read chunks one-by-one except for the latest one
  // and for each chunk call manageDataFunction
  const buffer = Buffer.alloc(chunkInfo.chunkSize);
  let i;

  const results = [];

  for (i = 0; i < chunkInfo.chunkNumber; i += 1) {
    fs.readSync(fd, buffer, 0, chunkInfo.chunkSize, null);
    // TODO: setup file Id management
    console.log(i);
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

  console.log('aspetto');
  // try {
  await Promise.all(results);
  console.log('finito');
  // } catch (e) {
  //   throw createError(
  //     `Error occurred while uploading data chunk #${i}`,
  //     errors.ERR_HTTP_UPLOAD,
  //   );
  // }

  // close file
  fs.closeSync(fd);

  // TODO: set correctly this return value
  return chunkInfo;
}

exports.uploadFile = uploadFile;
exports.announceFile = announceFile;
exports.getChunkSplitInfo = getChunkSplitInfo;
