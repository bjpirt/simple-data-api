'use strict';
const dbConfig = require('./lib/DynamoDbConfig')(process.env);
const dbConn = require('./lib/DynamoDbConnection')(dbConfig);
const dbGateway = require('./lib/gateways/Dynamo')(dbConn);
const useCases = require('./lib/use-cases')({ dbGateway, loginData: {
  user: process.env.MAIN_USER,
  pass_hash: process.env.PASS_HASH,
  jwt_secret: process.env.JWT_SECRET
}});
const handlers = require('./lib/handlers')(useCases);

module.exports = handlers;