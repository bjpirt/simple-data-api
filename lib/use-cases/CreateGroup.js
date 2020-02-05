module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;

  return async (data) => {
    const now = (new Date()).toISOString();
    const values = [];
    if(data.metrics){
      for(let metric in data.metrics){
        if(data.metrics[metric].value){
          if(!data.metrics[metric].time) data.metrics[metric].time = now;
          values.push({time: data.metrics[metric].time, value: data.metrics[metric].value})
        }
      }
    }else{
      data.metrics = {};
    }

    const group = await dbGateway.createGroup(data);
    await useCases.createGroupKey(group.id, "Default Key", ['*']);
    await dbGateway.createValues(group.id, values);
    return group;
  };
}
