module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async (group_id, reading_name, options) => {
    if(!options.end && !options.start) options.end = new Date();
    if(!options.end && options.start) options.end = new Date(options.start + 3600000);
    if(!options.start && options.end) options.start = new Date(options.end - 3600000);
    const intervalMs = options.interval * 1000;

    const bucketByTime = (time) => {
      const t = Date.parse(time)
      return (new Date(t - (t % intervalMs))).toISOString();
    }

    const rawValues = await dbGateway.getValues(group_id, reading_name, options);

    if(options.interval){
      const grouped = rawValues.reduce((acc, value) => {
        let timeBucket = bucketByTime(value.time);
        if(!acc[timeBucket]) acc[timeBucket] = [];
        acc[timeBucket].push(value.value);
        return acc;
      }, {});

      return Object.entries(grouped).map(([time, values]) => {
        return {time, value: values.reduce((a, b) => a + b, 0 )/values.length }
      });
    }
    return rawValues;
  };
}
