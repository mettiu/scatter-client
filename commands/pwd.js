const { pwdCommand } = require('../config');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

async function action(socket) {
  const data = { };
  const ack = await sendMessage(socket, pwdCommand.message, data);
  return JSON.parse(ack);
}

const command = {
  name: 'pwd',
  action,
};

Commander.createCommand(command);

module.exports = command;
