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
  userData: null,
  // currentFolder: null,
  // currentFolderId: null,
  // currentFolderName: null,
  // rootFolderId: null,
  // rootFolderName: null,
};

const vorpal = new Vorpal();

vorpal
  .delimiter(`${socketConfig.uri}:~$ `)
  .show();

let socket;
vorpal
  .command('login', 'Login into server. This should be the first action to perform!')
  .action(async (args, cb) => {
    vorpal.log('login in progress...');

    // manage login process using http calls
    let response;
    try {
      response = await login(httpConfig.login.uri, 'mettiu', 'mettiu');
      // TODO: prompt user for username and password information
      vorpal.log('You are now logged in.');
    } catch (e) {
      vorpal.log(`Something went wrong with login attempt. Server said '${e.statusCode}'`);
      vorpal.log(e);
      cb();
    }

    if (response.error) {
      vorpal.log(`Error occurred: ${response.error}`);
      cb();
    }

    // set user data from received response into status variable
    status.userData = response;

    // setup socket.io connection, passing jwt token into querystring parameter 'token'
    socket = io(socketConfig.uri, { query: { token: status.userData.jwt } });

    // Define connect and other socket.io connection related events management routines
    socket.on('connect', async () => {
      // check if this is the first connection. Otherwise, let it managege by
      // 'reconnect' event later on.
      if (!status.firstConnectionDone) {
        // set status stuff
        status.firstConnectionDone = true;
        status.connected = true;
        vorpal.log(`Connected to ${socketConfig.uri}`);

        // get root folder information for this user from server
        const root = await getRoot(socket);
        status.rootFolderId = root._id;
        status.rootFolderName = root.name;

        // show vorpal prompt
        vorpal.show();
      }
    });

    socket.on('disconnect', () => {
      // hide vorpal prompt and print console information about 'disconnect' event
      vorpal.ui.cancel();
      vorpal.log(`Connection to ${socketConfig.uri} lost. Trying to reconnect...`);

      // set status stuff
      status.connected = false;
    });

    socket.on('reconnect', () => {
      // Do this only if this is not the first connection attempt. otherwise,
      // let it manage by 'connect' event
      if (status.firstConnectionDone) {
        // set status stuff
        status.connected = true;

        // print console information and show vorpal prompt
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
