const { fileList } = require('../config');
const { sendMessage } = require('../utils/send-message');

// TODO: user remote path (now it's not used!!)
async function ls(socket) {
  const data = {};
  const ack = await sendMessage(socket, fileList.message, data);
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

exports.ls = ls;
