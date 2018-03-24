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

  const token = await rp(options);
  return token;
}

exports.login = login;
