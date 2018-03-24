// const fs = require('fs');
// const errors = require('errors');

// const configPath = './config.json';
// const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

// We have to export each object in order to access them separately
exports.http = {
  chunkUpload: {
    // size of the data chunk, in bytes
    size: 4096,
    // uri for POST http call for chunk upload
    uri: 'http://localhost:3000/uploadchunk',
  },
  fileAnnounce: {
    // uri for POST http call for file announce
    uri: 'http://localhost:3000/fileannounce',
  },
};


// const httpError = {
//   message: 'An error occurred during http upload',
//   code: 'ERR_HTTP_GENERIC',
// };
//
// const testError = {
//   message: 'Test error message',
//   code: 'ERR_TEST_GENERIC',
// };
//
// exports.errors = {
//   chunkUpload: {
//     httpError,
//   },
//   fileAnnounce: {
//     httpError,
//   },
//   test: {
//     testError,
//   },
// };
