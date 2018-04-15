const { fileList } = require('../config');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

async function action(socket) {
  const data = {};
  const ack = await sendMessage(socket, fileList.message, data);
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

const command = {
  name: 'ls',
  action,
};

Commander.createCommand(command);

module.exports = command;
