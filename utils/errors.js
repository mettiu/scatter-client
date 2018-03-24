
exports.createError = (message, data) => {
  const error = new Error(message);
  Object.assign(error, data);
  return error;
};

exports.errors = {
  ERR_TEST_GENERIC: {
    code: 'ERR_TEST_GENERIC',
    message: 'Test error message',
  },
  ERR_HTTP_UPLOAD: {
    code: 'ERR_HTTP_UPLOAD',
    message: 'An error occurred during http upload',
  },
  ERR_FILE_NOT_FOUND: {
    code: 'ERR_FILE_NOT_FOUND',
    message: 'Couldn\'t find required file',
  },
};
