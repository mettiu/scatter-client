const { remoteRoot } = require('../config');
const { sendMessage } = require('../utils/send-message');

// TODO: user remote path (now it's not used!!)
async function getRoot(socket) {
  const data = {};
  const ack = await sendMessage(socket, remoteRoot.message, data);
  return JSON.parse(ack);
}

exports.getRoot = getRoot;
