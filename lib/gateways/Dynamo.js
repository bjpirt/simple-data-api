function init(config) {
  let Dynamo = {
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

    createBulkMetrics: async (group_id, metrics) => {
      console.log(metrics);
      const metric_names = Object.keys(metrics);
      for(let i=0; i< metric_names.length; i++){
        let key = `${group_id}|${metric_names[i]}`;
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