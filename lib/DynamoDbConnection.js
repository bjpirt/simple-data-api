'use strict';
const util = require('util');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const { options, tables } = require('./DynamoDbOptions')();

const client = new AWS.DynamoDB.DocumentClient(options);
client.aput = util.promisify(client.put);
client.aget = util.promisify(client.get);
client.aupdate = util.promisify(client.update);
client.ascan = util.promisify(client.scan);
client.aquery = util.promisify(client.query);

module.exports = { client, tables };
