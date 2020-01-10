function init(config) {
  let Dynamo = {
    createGroup: async (name) => {
      //Create new random ID (short to make the URL easier to use)
      const id = await Dynamo.generateGroupId();

      const group = { name, metrics: {}, units: {}, id };
      await config.client.aput({
        TableName: config.tables.groupsTable,
        Item: group,
      })
      return group;
    },

    generateGroupId: async () => {
      for(let i = 0; i< 100; i++){
        let id = Math.random().toString(36).substring(2, 10);
        if(!(await Dynamo.getGroup(id))) return id;
      }
    },

    listGroups: async () => {
      return {msg: "List groups"}
    },

    getGroup: async (id) => {
      return (await config.client.aget({
        TableName: config.tables.groupsTable,
        Key: { id }
      })).Item
    },

    findOrCreateMetric: async (group_id, name) => {
    },

    insertValue: async (metric_id, time, value) => {
      await config.client.aput({
        TableName: config.tables.valuesTable,
        Item: { metric_id, time, value },
      })
    },

    listMetrics: async (group_id) => {
      return {msg: `Get metrics for group ${group_id}`}
    },

    createBulkMetrics: async (group_id, metrics) => {
      console.log(metrics);
      const metric_names = Object.keys(metrics);
      for(let i=0; i< metric_names.length; i++){
        let key = `${group_id}|${metric_names[i]}`;
        let metric = metrics[metric_names[i]]
        //let existing = await Dynamo.findOrCreateMetric(group_id, metric_names[i]);
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