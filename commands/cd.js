const { cdCommand } = require('../config');
const { sendMessage } = require('../utils/send-message');

async function cd(socket, name) {
  const data = { name };
  const ack = await sendMessage(socket, cdCommand.message, data);
  return JSON.parse(ack);
}

exports.cd = cd;
