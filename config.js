
// const configPath = './config.json';
// const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

const remote = 'http://localhost:3000';

exports.httpConfig = {
  chunkUpload: {
    // size of the data chunk, in bytes
    size: 4096,
    // uri for POST http call for chunk upload
    uri: `${remote}/uploadchunk`,
  },
  fileAnnounce: {
    // uri for POST http call for file announce
    uri: `${remote}/fileannounce`,
  },
  login: {
    // uri for POST http call for file announce
    uri: `${remote}/api/authentication/login`,
  },
};

exports.socketConfig = {
  uri: remote,
};
