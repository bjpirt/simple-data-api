const utils = require('../Utils');

module.exports = function (options) {
  const dbGateway = options.dbGateway;
  
  return async (id) => {
    const groupResult = await dbGateway.getGroup(id);
    if(groupResult) return utils.formatGroup(await dbGateway.getGroup(id));
  };
}
