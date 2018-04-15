const { remoteRoot } = require('../config');
const { sendMessage } = require('../utils/send-message');
const Commander = require('../utils/commander');

// TODO: user remote path (now it's not used!!)
async function action(socket) {
  const data = {};
  const ack = await sendMessage(socket, remoteRoot.message, data);
  return JSON.parse(ack);
}

const command = {
  name: 'getRoot',
  action,
};

Commander.createCommand(command);

module.exports = command;
