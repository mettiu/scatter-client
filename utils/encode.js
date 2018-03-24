
// See https://www.hacksparrow.com/base64-encoding-decoding-in-node-js.html
// for native base64 encode/decode example and explanation

const encoding = 'base64';
// const encoding = 'ascii';

// function to encode a binary buffer to base64 encoded string
function base64Encode(binaryBuffer) {
  return binaryBuffer.toString(encoding);
}

// function to return a binary buffer from base64 encoded string
function base64Decode(base64str) {
  // create buffer object from base64 encoded string,
  return Buffer.from(base64str, encoding);
}


exports.base64Encode = base64Encode;
exports.base64Decode = base64Decode;
