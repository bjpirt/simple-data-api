const utils = require('../Utils');

module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async () => {
    return await dbGateway.listGroups();
  };
}
