const Vorpal = require('vorpal');
const fs = require('fs');
const io = require('socket.io-client');

const cdCommand = require('./commands/cd');
const getRootCommand = require('./commands/getRoot');
const { httpConfig, socketConfig } = require('./config');
const loginCommand = require('./commands/login');
const lsCommand = require('./commands/ls');
const mkdirCommand = require('./commands/mkdir');
const pwdCommand = require('./commands/pwd');
const rmCommand = require('./commands/rm');
const rmdirCommand = require('./commands/rmdir');
const uploadFileCommand = require('./commands/fileUpload');

const Commander = require('./utils/commander');

const status = {
  // variables for managing connect/reconnect socket events
  firstConnectionDone: false,
  connected: false,

  // info from user model is saved into this variable at login
  userData: null,

  // info from folder model is saved into this variable at login
  rootFolder: null,

  // info from folder model is saved into this variable at login
  currentFolder: null,

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
      response = await Commander.exec(loginCommand.name, httpConfig.login.uri, 'mettiu', 'mettiu');
      // login(httpConfig.login.uri, 'mettiu', 'mettiu');
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
        status.rootFolder = await Commander.exec(getRootCommand.name, socket);
        status.currentFolder = status.rootFolder;

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
    this.log(await Commander.exec(lsCommand.name, socket));
    return cb();
  });

vorpal
  .command('upload <file>', 'Uploads <file> in current folder')
  .action(async function (args, cb) {
    this.log(`file: ${args.file}`);

    // check if file exists and is a regular file
    if (!fs.existsSync(args.file)) {
      vorpal.log(`File ${args.file} not found.`);
      cb();
      return;
    }
    if (!fs.statSync(args.file).isFile()) {
      vorpal.log(`'${args.file}' is not a regular file, but file was expected.`);
      cb();
      return;
    }

    let result;
    try {
      result = await Commander.exec(uploadFileCommand.name, socket, args.file);
    } catch (e) {
      throw e;
    }
    vorpal.log(uploadFileCommand.humanize(result));
    cb();
  });

vorpal
  .command('getroot', 'Gets remote file system root.')
  .action(async function (args, cb) {
    const root = await Commander.exec(getRootCommand.name, socket);
    this.log(root);
    status.rootFolder = root;
    status.currentFolder = root;
    cb();
  });

vorpal
  .command('cd <destination>', 'Change current folder and step into <destination> folder.')
  .action(async function (args, cb) {
    const destinationFolder = await Commander.exec(cdCommand.name, socket, args.destination);
    this.log(destinationFolder);
    if (!destinationFolder.error) status.currentFolder = destinationFolder;
    cb();
  });

vorpal
  .command('mkdir <name>', 'Create folder <name into current folder.')
  .action(async function (args, cb) {
    this.log(await Commander.exec(mkdirCommand.name, socket, args.name));
    cb();
  });

vorpal
  .command('pwd', 'Check your current folder.')
  .action(async function (args, cb) {
    const pwdResult = await Commander.exec(pwdCommand.name, socket);
    this.log(pwdResult);
    status.currentFolder = pwdResult.folder;
    if (pwdResult.error) {
      status.rootFolder = pwdResult.folder;
    }
    cb();
  });

vorpal
  .command('rm <name>', 'Remove file <name> in current folder.')
  .action(async function (args, cb) {
    this.log(await Commander.exec(rmCommand.name, socket, args.name));
    cb();
  });

vorpal
  .command('rmdir <name>', 'Remove folder <name> in current folder.')
  .action(async function (args, cb) {
    this.log(await Commander.exec(rmdirCommand.name, socket, args.name));
    cb();
  });
