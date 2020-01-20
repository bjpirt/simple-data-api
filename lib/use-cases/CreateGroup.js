module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;

  return async (data) => {
    const metrics = {};
    const units = {};
    if(data.metrics){
      for(let metric in data.metrics){
        metrics[metric] = {}
        if(data.metrics[metric].time) metrics[metric].time = data.metrics[metric].time;
        if(data.metrics[metric].value) metrics[metric].value = data.metrics[metric].value;
        if(data.metrics[metric].unit) units[metric] = data.metrics[metric].unit;
      }
    }

    return await dbGateway.createGroup(data.name, metrics, units);
  };
}
