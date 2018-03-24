const Vorpal = require('vorpal');
const io = require('socket.io-client');

const { getRoot } = require('./utils/getRoot');
const { httpConfig, socketConfig } = require('./config');
const { login } = require('./utils/login');
const { ls } = require('./utils/ls');
const { uploadFile } = require('./utils/fileUpload');

const status = {
  firstConnectionDone: false,
  connected: false,
  currentFolderId: null,
  currentFolderName: null,
  rootFolderId: null,
  rootFolderName: null,
  sessionToken: null,
  userId: '5a3507457db4e6110651379b',
  userData: null,
};

const vorpal = new Vorpal();

vorpal
  .delimiter(`${socketConfig.uri}:~$ `)
  .show();

let socket;
vorpal
  .command('login', 'Login into server. This should be the first action to perform!')
  .action(async function (args, cb) {
    const v = this;
    vorpal.log('login in progress...');
    vorpal.hide();
    let response;
    try {
      response = await login(httpConfig.login.uri, 'mettiu', 'mettiu');
      vorpal.log(response);
    } catch (e) {
      vorpal.log(`Something went wrong with login attempt. Server said '${e.statusCode}'`);
      vorpal.log(e);
      vorpal.show();
      cb();
    }

    if (response.error) {
      v.log(`Error occurred: ${response.error}`);
      cb();
    }

    status.userData = response;
    status.sessionToken = status.userData.jwt;
    status.userId = status.userData._id; // eslint-disable-line no-underscore-dangle
    // this.log(status);
    socket = io(socketConfig.uri, { query: { token: status.sessionToken } });

    socket.on('connect', async () => {
      if (!status.firstConnectionDone) {
        status.firstConnectionDone = true;
        status.connected = true;
        v.log(`Connected to ${socketConfig.uri}`);
        const root = await getRoot(socket);
        status.rootFolderId = root._id;
        status.rootFolderName = root.name;
        vorpal.show();
      }
    });

    socket.on('disconnect', () => {
      vorpal.ui.cancel();
      vorpal.log(`Connection to ${socketConfig.uri} lost. Trying to reconnect...`);
      // vorpal.hide();
      // TODO: set connected flag in status <<--------------------------------- !!!
    });

    socket.on('reconnect', () => {
      if (status.firstConnectionDone) {
        status.connected = true;
        vorpal.log(`Connection to ${socketConfig.uri} re-established.`);
        vorpal.show();
      }
    });

    socket.on('error', (error) => {
      // do something with err
      vorpal.log(error);
    });

    socket.on('wellcome', (data) => {
      vorpal.log(`Server says: ${data}`);
      // vorpal.show();
    });

    cb();
  });

vorpal
  .command('disable', 'Disables Vorpal. No input will be read or accepted for 10 seconds.')
  .action((args, cb) => {
    vorpal.hide();
    setTimeout(() => { vorpal.show(); cb(); }, 10000);
  });

vorpal
  .command('ls', 'Outputs file list.')
  .action(async function (args, cb) {
    if (!socket || !socket.connected) {
      this.log('You are not connected.');
      return cb();
    }
    this.log('ls in progress');
    this.log(await ls(socket));
    return cb();
  });

vorpal
  .command('upload <file> <destinationPath>', 'Uploads <file> with specified <destinationPath>')
  .action(async function (args, cb) {
    this.log(`file: ${args.file}`);
    await uploadFile(socket, args.file, args.destinationPath);
    cb();
  });

vorpal
  .command('getroot', 'Gets remote file system root.')
  .action(async function (args, cb) {
    this.log(await getRoot(socket));
    cb();
  });
