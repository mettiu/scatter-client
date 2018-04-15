const { fileUpload } = require('../config');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

async function action(socket, filePath) {
  const fileStats = fs.statSync(filePath);
  const data = {
    fileName: path.parse(filePath).base,
    size: fileStats.size,
    lastModified: Math.round(fileStats.mtimeMs),
  };

  return JSON.parse(await sendMessage(socket, fileUpload.message, data));
}

const command = {
  name: 'announceFile',
  action,
};

Commander.createCommand(command);

module.exports = command;
