
// const configPath = './config.json';
// const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

const remote = 'http://localhost:3000';

exports.httpConfig = {
  login: {
    // uri for POST http call for file announce
    uri: `${remote}/api/authentication/login`,
  },
};

exports.socketConfig = {
  uri: remote,
};

exports.chunkUpload = {
  // size of the data chunk, in bytes
  size: 4096,
  message: 'chunk-upload',
};

exports.fileUpload = {
  message: 'file-upload',
};

exports.fileList = {
  message: 'file-list',
};

exports.remoteRoot = {
  message: 'get-root',
};
