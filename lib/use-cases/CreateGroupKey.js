const { generateRandomId } = require('../Utils');
const jwt = require('jsonwebtoken');

module.exports = (options, useCases) => {
  const dbGateway = options.dbGateway;

  return async (groupId, name, methods) => {
    const payload = { groupId, methods, scope: 'group' }
    const token = jwt.sign(payload, options.loginData.jwt_secret);
    const keyData = { name, methods, token, id: generateRandomId(10) }
    await dbGateway.createGroupKey(groupId, keyData);
    return keyData;
  }
}