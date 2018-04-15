const { rmCommand } = require('../config');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

async function action(socket, filename) {
  const ack = await sendMessage(socket, rmCommand.message, { filename });
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

const command = {
  name: 'rm',
  action,
};

Commander.createCommand(command);

module.exports = command;
