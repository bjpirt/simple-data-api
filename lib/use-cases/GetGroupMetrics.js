module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async (group_id) => {
    const metrics = await dbGateway.listMetrics(group_id);
    return metrics.map(metric => {
      return { name: metric.name, latestValue: { time: metric.lastvaluetime, value: metric.lastvalue } };
    });
  };
}
