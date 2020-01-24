module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async (groupId, data) => {
    const group = await useCases.getGroup(groupId);
    const groupUpdate = {metrics: {}};
    const metricValues = [];
    let readings = {};
    Object.keys(data.values).forEach(time => {
      for(let i=0; i< data.values[time].length; i++) {
        const metric = data.columns[i];
        // Update latest values if these are more recent
        if(!group.metrics[metric] ||
          (group.metrics[metric] &&
          group.metrics[metric].time < time)
        ){
          if(!groupUpdate.metrics[metric] || 
            (groupUpdate.metrics[metric] && groupUpdate.metrics[metric].time < time)
          ){
            groupUpdate.metrics[metric] = { time, value: data.values[time][i] };
          }
        }
        metricValues.push({ metric, time, value: data.values[time][i] })
      };
    });

    if(Object.keys(groupUpdate.metrics).length > 0){
      await useCases.updateGroup(groupId, groupUpdate);
    }
    return await dbGateway.createValues(groupId, metricValues);
  };
}
