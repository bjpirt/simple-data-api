const utils = require('../Utils');

module.exports = function (options) {
  const dbGateway = options.dbGateway;
  
  return async (id) => {
    return utils.formatGroup(await dbGateway.getGroup(id));
  };
}
