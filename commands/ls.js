
function sendMessage(socket, eventname, data) {
  return new Promise((resolve) => {
    socket.on('connect_timeout', () => console.log('error!'));
    socket.emit(eventname, data, ack => resolve(ack));
  });
}


// TODO: user remote path (now it's not used!!)
async function ls(socket) {
  const data = {};
  const ack = await sendMessage(socket, 'file-list', data);
  // console.log(JSON.parse(ack));
  return JSON.parse(ack);
}

exports.ls = ls;
