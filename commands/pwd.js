const { pwdCommand } = require('../config');
const { sendMessage } = require('../utils/send-message');

async function pwd(socket) {
  const data = { };
  const ack = await sendMessage(socket, pwdCommand.message, data);
  return JSON.parse(ack);
}

exports.pwd = pwd;
