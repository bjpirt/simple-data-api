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

      for(let i=0; i<100; i++){
        try{
          //Create new random ID (short to make the URL easier to use)
          group.id = Dynamo.generateGroupId();

          const Item = { groupName: group.name, metricValues, metricUnits, id: group.id };
          await config.client.aput({
            TableName: config.tables.groupsTable,
            ConditionExpression: 'attribute_not_exists(metricValues)',
            Item
          })
          return group;
        }catch(err){
          if(err.code !== 'ConditionalCheckFailedException'){
            throw(err);
          }
        }
      }
    },

    updateGroup: async (id, group) => {
      const updateExpressionItems = []
      const ExpressionAttributeNames = {}
      const ExpressionAttributeValues = {}

      if(group.name){
        updateExpressionItems.push('groupName = :name')
        ExpressionAttributeValues[':name'] = group.name;
      }

      let keyCounter = 0;
      if(Object.keys(group.metrics).length > 0){
        for(let key of Object.keys(group.metrics)){
          if(group.metrics[key].time && group.metrics[key].value){
            updateExpressionItems.push(`metricValues.#metricName${keyCounter} = :metricValue${keyCounter}`)
            ExpressionAttributeNames[`#metricName${keyCounter}`] = key;
            ExpressionAttributeValues[`:metricValue${keyCounter}`] = { time: group.metrics[key].time, value: group.metrics[key].value };
          }
          if(group.metrics[key].unit){
            updateExpressionItems.push(`metricUnits.#metricName${keyCounter} = :unitValue${keyCounter}`)
            ExpressionAttributeNames[`#metricName${keyCounter}`] = key;
            ExpressionAttributeValues[`:unitValue${keyCounter}`] = group.metrics[key].unit;
          }
          keyCounter++;
        }
      }

      const UpdateExpression = 'SET ' + updateExpressionItems.join(', ');
      const params = {
        TableName: config.tables.groupsTable,
        Key: { id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ConditionExpression: 'attribute_exists(metricValues)'
      }
      try{
        return await config.client.aupdate(params)
      }catch(err){
        if(err.code === 'ConditionalCheckFailedException'){
          throw("NotFoundException");
        }else{
          throw(err);
        }
      }
    },

    generateGroupId: () => {
      return Math.random().toString(36).substring(2, 10);
    },

    listGroups: async () => {
      const groupsResult = await config.client.ascan({
        TableName : config.tables.groupsTable
      })

      return groupsResult.Items.map(utils.formatDynamoGroup);
    },

    getGroup: async (id) => {
      const group = await config.client.aget({
        TableName: config.tables.groupsTable,
        Key: { id }
      });
      if(group.Item) return utils.formatDynamoGroup(group.Item);
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
            throw(err);
          }
        }
      }
    },

    getValues: async (groupId, metricName, options) => {
      results = await config.client.aquery({
        TableName : config.tables.valuesTable,
        KeyConditionExpression: 'groupId = :groupId and metricTime BETWEEN :start AND :end',
        ProjectionExpression: 'metricTime, metricValues.#metricName',
        FilterExpression: 'attribute_exists (metricValues.#metricName)',
        ExpressionAttributeValues: {':groupId': groupId, ':start': options.start.toISOString(), ':end': options.end.toISOString()},
        ExpressionAttributeNames: {'#metricName': metricName},
      });

      return results.Items.map(item => {
        return {time: item.metricTime, value: item.metricValues[metricName]};
      });

    }
  };
  return Dynamo;
};
