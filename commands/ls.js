const { sendMessage } = require('../utils/send-message');

// TODO: user remote path (now it's not used!!)
async function ls(socket) {
  const data = {};
  const ack = await sendMessage(socket, 'file-list', data);
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

exports.ls = ls;
