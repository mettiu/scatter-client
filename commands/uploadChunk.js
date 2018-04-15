const cipher = require('../utils/cipher');
const { chunkUpload } = require('../config');
const encode = require('../utils/encode');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

async function action(socket, buffer, seq, token) {
  // crypt and then encode data chunk
  const data = {
    seq,
    token,
    buffer: encode.base64Encode(cipher.crypt(buffer)),
    chunkSize: buffer.length,
  };
  return sendMessage(socket, chunkUpload.message, data);
}

const command = {
  name: 'uploadChunk',
  action,
};

Commander.createCommand(command);

module.exports = command;
