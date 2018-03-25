
// This function gets:
// - a socket.io instance;
// - an event name string;
// - a data variable
// and sends through the socket the event, with passed data.
// This methos returns a promise, to be used with async/await syntax.
exports.sendMessage = (socket, eventname, data) => new Promise((resolve) => {
  socket.on('connect_timeout', () => console.log('error!'));
  socket.emit(eventname, data, ack => resolve(ack));
});
