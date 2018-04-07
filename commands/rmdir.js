const { rmdirCommand } = require('../config');
const { sendMessage } = require('../utils/send-message');

async function rmdir(socket, folderName) {
  const ack = await sendMessage(socket, rmdirCommand.message, { folderName });
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

exports.rmdir = rmdir;
