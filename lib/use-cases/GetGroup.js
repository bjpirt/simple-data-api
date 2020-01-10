module.exports = function (options) {
  const dbGateway = options.dbGateway;
  
  return async (id) => {
    return await dbGateway.getGroup(id);
  };
}
