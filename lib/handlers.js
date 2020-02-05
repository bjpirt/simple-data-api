'use strict';

module.exports = (useCases) => {

  const send = (data) => {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  }

  const catchError = (fn) => {
    return (async (event) => {
      try {
        return await fn(event)
      } catch (err) {
        if(err === 'NotFoundException'){
          return { statusCode: 404 };
        }else if(err === 'Unauthorized'){
            return { statusCode: 401 };
        }else{
          console.log(err);
          return { statusCode: 500 }
        }
      }
    })
  }


  return {
    listGroups: catchError(async (event) => {
      const groups = await useCases.listGroups();
      return send(groups);
    }),

    createGroup: catchError(async (event) => {
      const group = await useCases.createGroup(JSON.parse(event.body));
      return {
        statusCode: 302,
        headers: { Location: `/groups/${group.id}` }
      };
    }),

    getGroup: catchError(async (event) => {
      const group = await useCases.getGroup(event.pathParameters.groupId);
      if(group){
        return send(group);
      }else{
        return { statusCode: 404 };
      }
    }),

    updateGroup: catchError(async (event) => {
      await useCases.updateGroup(event.pathParameters.groupId, JSON.parse(event.body));
      return { statusCode: 204 };
    }),

    listGroupKeys: catchError(async (event) => {
      const keys = await useCases.listGroupKeys(event.pathParameters.groupId);
      return send(keys);
    }),

    createMetrics: catchError(async (event) => {
      await useCases.createBulkReadings(event.pathParameters.groupId, JSON.parse(event.body));
      return { statusCode: 204 };
    }),

    getMetric: catchError(async (event) => {
      const values = await useCases.getMetric(event.pathParameters.groupId, event.pathParameters.metricId, event.queryStringParameters);
      return send(values);
    }),

    login: catchError(async (event) => {
      const credentials = await useCases.login(JSON.parse(event.body));
      return send(credentials);
    })
  }
}
