module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async (group_id, reading_name, options) => {
    return await dbGateway.getValues(group_id, reading_name, options);
  };
}
