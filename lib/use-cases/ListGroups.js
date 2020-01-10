module.exports = function (options) {
  const dbGateway = options.dbGateway;
  
  return async () => {
    return await dbGateway.listGroups();
  };
}
