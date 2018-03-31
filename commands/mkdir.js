const { makeDir } = require('../config');
const { sendMessage } = require('../utils/send-message');

async function mkdir(socket, name) {
  const data = { name };
  const ack = await sendMessage(socket, makeDir.message, data);
  return JSON.parse(ack);
}

exports.mkdir = mkdir;
