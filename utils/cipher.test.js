const cipher = require('./cipher');

test('Test cipher functions', () => {
  const originalData = 'test data content';
  const encripted = cipher.crypt(Buffer.from(originalData, 'ascii'));
  const decripted = cipher.decrypt(encripted).toString('ascii');

  expect(decripted).toBe(originalData);
});
