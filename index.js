'use strict';

const dbConn = require('./lib/DynamoDbConnection');
const dbGateway = require('./lib/gateways/Dynamo')(dbConn);
const useCases = require('./lib/use-cases')({ dbGateway });

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
      }else{
        console.log(err);
        return { statusCode: 500 }
      }
    }
  })
}

module.exports.listGroups = catchError(async (event) => {
  const groups = await useCases.listGroups();
  return send(groups);
});

module.exports.createGroup = catchError(async (event) => {
  const group = await useCases.createGroup(JSON.parse(event.body));
  return {
    statusCode: 302,
    headers: { Location: `/groups/${group.id}` }
  };
});

module.exports.getGroup = catchError(async (event) => {
  const group = await useCases.getGroup(event.pathParameters.groupId);
  if(group){
    return send(group);
  }else{
    return { statusCode: 404 };
  }
});

module.exports.updateGroup = catchError(async (event) => {
  await useCases.updateGroup(event.pathParameters.groupId, JSON.parse(event.body));
  return { statusCode: 204 };
});

module.exports.createMetrics = catchError(async (event) => {
  await useCases.createBulkReadings(event.pathParameters.groupId, JSON.parse(event.body));
  return { statusCode: 204 };
});

module.exports.getMetric = catchError(async (event) => {
  const values = await useCases.getMetric(event.pathParameters.groupId, event.pathParameters.metricId, event.queryStringParameters);
  return send(values);
});
