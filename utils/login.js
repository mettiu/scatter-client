const rp = require('request-promise-native');

async function login(uri, username, password) {
  const options = {
    method: 'POST',
    uri,
    body: {
      username,
      password,
    },
    json: true,
  };

  const user = await rp(options);
  return user;
}

exports.login = login;
