const utils = require('../Utils');

module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async (id) => {
    return await dbGateway.getGroup(id);
  };
}
