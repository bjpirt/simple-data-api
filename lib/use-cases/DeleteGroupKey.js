module.exports = (options, useCases) => {
  const dbGateway = options.dbGateway;

  return async (groupId, keyId) => {
    await dbGateway.deleteGroupKey(groupId, keyId);
  }
}