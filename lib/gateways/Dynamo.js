const utils = require('../Utils');

module.exports = (config) => {
  const Dynamo = {
    createGroup: async (group) => {
      const metricValues = {};
      const metricUnits = {};

      for(let metric in group.metrics){
        metricValues[metric] = {}
        if(group.metrics[metric].time) metricValues[metric].time = group.metrics[metric].time;
        if(group.metrics[metric].value) metricValues[metric].value = group.metrics[metric].value;
        if(group.metrics[metric].unit) metricUnits[metric] = group.metrics[metric].unit;
      }
      //Create new random ID (short to make the URL easier to use)
      group.id = await Dynamo.generateGroupId();

      const Item = { groupName: group.name, metricValues, metricUnits, id: group.id };
      await config.client.aput({
        TableName: config.tables.groupsTable,
        Item,
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
      const groupsResult = await config.client.ascan({
        TableName : config.tables.groupsTable
      })

      return groupsResult.Items.map(utils.formatGroup);
    },

    getGroup: async (id) => {
      const group = await config.client.aget({
        TableName: config.tables.groupsTable,
        Key: { id }
      });
      if(group.Item) return utils.formatDynamoGroup(group(id));
    },

    updateValues: async (item) => {
      const updateExpressionItems = []
      const ExpressionAttributeNames = {}
      const ExpressionAttributeValues = {}

      let keyCounter = 0;
      for(let key of Object.keys(item.metricValues)){
        updateExpressionItems.push(`metricValues.#metricName${keyCounter} = :metricValue${keyCounter}`)
        ExpressionAttributeNames[`#metricName${keyCounter}`] = key;
        ExpressionAttributeValues[`:metricValue${keyCounter}`] = item.metricValues[key];
        keyCounter++;
      }
      const UpdateExpression = 'SET ' + updateExpressionItems.join(', ');
      const params = {
        TableName: config.tables.valuesTable,
        Key: { groupId: item.groupId, metricTime: item.metricTime },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues
      }
      return await config.client.aupdate(params)
    },

    createValues: async (groupId, values) => {
      const grouped = values.reduce((acc, value) => {
        if(!acc[value.time]) acc[value.time] = {groupId, metricTime: value.time, metricValues: {}};
        acc[value.time].metricValues[value.metric] = value.value;
        return acc;
      }, {});

      for(let time of Object.keys(grouped)){
        try{
          await config.client.aput({
            TableName: config.tables.valuesTable,
            Key: {
              groupId: grouped[time].groupId,
              metricTime: time
            },
            Item: grouped[time],
            ConditionExpression: 'attribute_not_exists(metricValues)'
          })
        }catch(err){
          if(err.code === 'ConditionalCheckFailedException'){
            await Dynamo.updateValues(grouped[time]);
          }else{
            console.log(err);
            raise(err);
          }
        }
      }
    },

    getValues: async (groupId, metricName, options) => {
      if(!options.end) options.end = (new Date()).toISOString();
      if(!options.start) options.start = (new Date(Date.parse(options.end) - 3600000)).toISOString();

      results = await config.client.aquery({
        TableName : config.tables.valuesTable,
        KeyConditionExpression: 'groupId = :groupId and metricTime BETWEEN :start AND :end',
        ProjectionExpression: 'metricTime, metricValues.#metricName',
        FilterExpression: 'attribute_exists (metricValues.#metricName)',
        ExpressionAttributeValues: {':groupId': groupId, ':start': options.start, ':end': options.end},
        ExpressionAttributeNames: {'#metricName': metricName},
      });

      return results.Items.map(item => {
        return {time: item.metricTime, value: item.metricValues[metricName]};
      });

    }
  };
  return Dynamo;
};
