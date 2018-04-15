const rp = require('request-promise-native');
const Commander = require('../utils/commander');

async function action(uri, username, password) {
  const options = {
    method: 'POST',
    uri,
    body: {
      // email: 'mettiu@gmail.com',
      username,
      password,
    },
    json: true,
  };

  const token = await rp(options);
  return token;
}

const command = {
  name: 'login',
  action,
};

Commander.createCommand(command);

module.exports = command;
