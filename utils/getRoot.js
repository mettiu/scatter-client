
function sendMessage(socket, eventname, data) {
  return new Promise((resolve) => {
    socket.on('connect_timeout', () => console.log('error!'));
    socket.emit(eventname, data, ack => resolve(ack));
  });
}


// TODO: user remote path (now it's not used!!)
async function getRoot(socket) {
  const data = {};
  const ack = await sendMessage(socket, 'get-root', data);
  return JSON.parse(ack);
}

exports.getRoot = getRoot;
