module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;

  return async (data) => {
    const now = (new Date()).toISOString()
    if(data.metrics){
      for(let metric in data.metrics){
        if(!data.metrics[metric].time && data.metrics[metric].value) data.metrics[metric].time = now;
      }
    }else{
      data.metrics = {};
    }

    return await dbGateway.createGroup(data);
  };
}
