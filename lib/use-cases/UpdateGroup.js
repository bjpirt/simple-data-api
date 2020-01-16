module.exports = function (options) {
  const dbGateway = options.dbGateway;

  return async (id, data) => {
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
        }
        if(data.metrics[metric].unit) units[metric] = data.metrics[metric].unit;
      }
    }

    return await dbGateway.updateGroup(id, data.name, metrics, units);
  };
}
