module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;

  return async (groupId, data) => {
    const metricValues = []
    const metrics = {};
    const units = {};
    const now = (new Date()).toISOString()
    if(data.metrics){
      for(let metric in data.metrics){
        metrics[metric] = {}
        if(data.metrics[metric].value){
          if(data.metrics[metric].time){
            metrics[metric].time = data.metrics[metric].time;
          }else{
            metrics[metric].time = now;
          }
          if(data.metrics[metric].value) metrics[metric].value = data.metrics[metric].value;
          metricValues.push({time: metrics[metric].time, value: metrics[metric].value, metric})
        }
        if(data.metrics[metric].unit) units[metric] = data.metrics[metric].unit;
      }
    }

    await dbGateway.updateGroup(groupId, data.name, metrics, units);
    return await useCases.createValues(groupId, metricValues);
  };
}
