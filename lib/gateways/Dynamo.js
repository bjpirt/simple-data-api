function init(config) {
  const valuesBucketSize = process.env.VALUES_BUCKET_SIZE || 3600
  const Dynamo = {
    createGroup: async (groupName, metricValues, metricUnits) => {
      if(!metricValues) metricValues = {}
      if(!metricUnits) metricUnits = {}
      //Create new random ID (short to make the URL easier to use)
      const id = await Dynamo.generateGroupId();

      const group = { groupName, metricValues, metricUnits, id };
      await config.client.aput({
        TableName: config.tables.groupsTable,
        Item: group,
      })
      return group;
    },

    updateGroup: async (id, name, metrics, units) => {
      const updateExpressionItems = []
      const ExpressionAttributeNames = {}
      const ExpressionAttributeValues = {}
      if(name){
        updateExpressionItems.push('groupName = :name')
        ExpressionAttributeValues[':name'] = name;
      }

      let keyCounter = 0;
      if(Object.keys(metrics).length > 0){
        for(let key of Object.keys(metrics)){
          if(metrics[key].time && metrics[key].value){
            updateExpressionItems.push(`metricValues.#metricName${keyCounter} = :metricValue${keyCounter}`)
            ExpressionAttributeNames[`#metricName${keyCounter}`] = key;
            ExpressionAttributeValues[`:metricValue${keyCounter}`] = metrics[key];
            keyCounter++;
          }
        }
      }

      if(Object.keys(units).length > 0){
        for(let key of Object.keys(units)){
          updateExpressionItems.push(`metricUnits.#metricName${keyCounter} = :unitValue${keyCounter}`)
          ExpressionAttributeNames[`#metricName${keyCounter}`] = key;
          ExpressionAttributeValues[`:unitValue${keyCounter}`] = units[key];
          keyCounter++;
        }
      }

      const UpdateExpression = 'SET ' + updateExpressionItems.join(', ');
      const params = {
        TableName: config.tables.groupsTable,
        Key: { id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
      }
      return await config.client.aupdate(params)
    },

    generateGroupId: async () => {
      for(let i = 0; i< 100; i++){
        let id = Math.random().toString(36).substring(2, 10);
        if(!(await Dynamo.getGroup(id))) return id;
      }
    },

    listGroups: async () => {
      return (await config.client.ascan({
        TableName : config.tables.groupsTable
      })).Items
    },

    getGroup: async (id) => {
      return (await config.client.aget({
        TableName: config.tables.groupsTable,
        Key: { id }
      })).Item
    },

    insertValue: async (metric_id, time, value) => {
      await config.client.aput({
        TableName: config.tables.valuesTable,
        Item: { metric_id, time, value },
      })
    },

    createValues: async (groupId, values) => {
      const updateExpressionItems = []
      const ExpressionAttributeNames = {}
      const ExpressionAttributeValues = {}

      const timeBucket = (t) => {
        const parsed = Date.parse(t)
        return (new Date(parsed - (parsed % (1000 * valuesBucketSize)))).toISOString()
      }

      const grouped = values.reduce((acc, value) => {
        bucket = timeBucket(value.time);
        if(!acc[bucket]) acc[bucket] = {};
        if(!acc[bucket][value.metric]) acc[bucket][value.metric] = {};
        acc[bucket][value.metric][value.time] = value.value;
        return acc;
      }, {});
      console.log(grouped)

      let keyCounter = 0;
      for(let timeStart of Object.keys(grouped)){
        for(let metric of Object.keys(grouped[timeStart])){
          for(let time of Object.keys(grouped[timeStart][metric])){
            console.log(timeStart, metric, time, grouped[timeStart][metric][time])

            ExpressionAttributeValues[`:emptyHash`] = {}

            updateExpressionItems.push(`metricValues.#metricName${keyCounter}.#metricTime${keyCounter} = :metricValue${keyCounter}`)
            ExpressionAttributeNames[`#metricName${keyCounter}`] = metric;
            ExpressionAttributeNames[`#metricTime${keyCounter}`] = time;
            ExpressionAttributeValues[`:metricValue${keyCounter}`] = grouped[timeStart][metric][time];

            keyCounter++;
          }
        }

        const UpdateExpression = 'SET ' + updateExpressionItems.join(', ');
        const params = {
          TableName: config.tables.valuesTable,
          Key: { groupAndTime: `${groupId}-${timeStart}`, timeStart },
          Item: {
            groupId, timeStart
          },
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues
        }
        console.log(params)
        await config.client.aupdate(params)
      }
    },

    createBulkMetrics: async (groupId, metrics) => {
      console.log(metrics);
      const metric_names = Object.keys(metrics);
      for(let i=0; i< metric_names.length; i++){
        let key = `${groupId}|${metric_names[i]}`;
        let metric = metrics[metric_names[i]]
        for(let v=0; v< metric.length; v++){
          if(metric[v].value !== null){
            await Dynamo.insertValue(key, metric[v].time, metric[v].value);
          }
        }
      }
    },

    getValues: async (group_id, reading_name, options) => {
      return {msg: `Get metrics for group ${group_id} / metric: ${reading_name}`}
    }
  };
  return Dynamo;
}

module.exports = init;