module.exports = function (options, useCases) {
  const dbGateway = options.dbGateway;
  
  return async (group_id, reading_name, options) => {
    const intervalMs = options.interval * 1000;
    const bucketByTime = (time) => {
      const t = Date.parse(time)
      return (new Date(t - (t % intervalMs))).toISOString();
    }

    const rawValues = await dbGateway.getValues(group_id, reading_name, options);

    if(options.interval){
      const grouped = rawValues.reduce((acc, value) => {
        console.log(value)
        let timeBucket = bucketByTime(value.time);
        if(!acc[timeBucket]) acc[timeBucket] = [];
        acc[timeBucket].push(value.value);
        return acc;
      }, {});
      console.log(grouped);
      return Object.entries(grouped).map((time, values) => {
        console.log(time, values)
        return {time, value: values.reduce((a, b) => a + b, 0 ) }
      });
    }
    return rawValues;
  };
}
