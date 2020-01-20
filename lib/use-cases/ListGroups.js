const utils = require('../Utils');

module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async () => {
    const groupsResult = await dbGateway.listGroups();
    return groupsResult.map(utils.formatGroup);
  };
}
