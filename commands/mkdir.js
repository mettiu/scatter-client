const { makeDir } = require('../config');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

async function action(socket, name) {
  const data = { name };
  const ack = await sendMessage(socket, makeDir.message, data);
  return JSON.parse(ack);
}
const command = {
  name: 'mkdir',
  action,
};

Commander.createCommand(command);

module.exports = command;
