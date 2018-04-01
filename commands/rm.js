const { rmCommand } = require('../config');
const { sendMessage } = require('../utils/send-message');

async function rm(socket, filename) {
  const ack = await sendMessage(socket, rmCommand.message, { filename });
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

exports.rm = rm;
