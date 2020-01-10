module.exports = function (options) {
  const dbGateway = options.dbGateway;
  
  return async (group_id, data) => {
    let readings = {};
    Object.keys(data.values).forEach(time => {
      for(let i=0; i< data.values[time].length; i++) {
        if(!readings[data.columns[i]]) readings[data.columns[i]] = []
        readings[data.columns[i]].push({ time, value: data.values[time][i] });
      };
    });
    return await dbGateway.createBulkMetrics(group_id, readings);
  };
}
