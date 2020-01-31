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

module.exports.listGroups = async () => {
  try {
    const groups = await useCases.listGroups();
    return send(groups);
  } catch (err) {
    console.log(err);
    return { statusCode: 500 }
  }
}

module.exports.createGroup = async (event) => {
  try {
    const group = await useCases.createGroup(JSON.parse(event.body));
    return {
      statusCode: 302,
      headers: { Location: `/groups/${group.id}` }
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500 }
  }
}

module.exports.getGroup = async (event) => {
  try {
    const group = await useCases.getGroup(event.pathParameters.groupId);
    if(group){
      return send(group);
    }else{
      return { statusCode: 404 };
    }
  } catch (err) {
    console.log(err);
    return { statusCode: 500 }
  }
}

module.exports.updateGroup = async (event) => {
  try {
    await useCases.updateGroup(event.pathParameters.groupId, JSON.parse(event.body));
    return { statusCode: 204 };
  } catch (err) {
    if(err === 'NotFoundException'){
      return { statusCode: 404 };
    }else{
      console.log(err);
      return { statusCode: 500 }
    }
  }
}

module.exports.createMetrics = async (event) => {
  try {
    await useCases.createBulkReadings(event.pathParameters.groupId, JSON.parse(event.body));
    return { statusCode: 204 };
  } catch (err) {
    if(err === 'NotFoundException'){
      return { statusCode: 404 };
    }else{
      console.log(err);
      return { statusCode: 500 }
    }
  }
}

module.exports.getMetric = async (event) => {
  try {
    const values = await useCases.getMetric(event.pathParameters.groupId, event.pathParameters.metricId, event.queryStringParameters);
    return send(values);
  } catch (err) {
    if(err === 'NotFoundException'){
      return { statusCode: 404 };
    }else{
      console.log(err);
      return { statusCode: 500 }
    }
  }
}
