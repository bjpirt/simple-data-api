module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;

  return async (groupId, data) => {
    const metricValues = []
    const now = (new Date()).toISOString()
    if(data.metrics){
      for(let metric in data.metrics){
        if(data.metrics[metric].value){
          if(!data.metrics[metric].time) data.metrics[metric].time = now;
          metricValues.push({time: data.metrics[metric].time, value: data.metrics[metric].value, metric})
        }
      }
    }

    await dbGateway.updateGroup(groupId, data);
    return await useCases.createValues(groupId, metricValues);
  };
}
