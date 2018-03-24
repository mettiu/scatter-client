const encode = require('./encode');

test('Test encode functions', () => {
  const originalData = 'test data content';
  const encoded = encode.base64Encode(Buffer.from(originalData, 'ascii'));
  const decoded = encode.base64Decode(encoded).toString('ascii');

  expect(decoded).toBe(originalData);
});
