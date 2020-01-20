module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;

  return async (groupId, values) => {
    return await dbGateway.createValues(groupId, values);
  };
}
