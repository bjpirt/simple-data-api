module.exports = function (options) {
  const dbGateway = options.dbGateway;
  
  return async (data) => {
    return await dbGateway.createGroup(data.name);
  };
}
