'use strict';
const util = require('util');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

const client = new AWS.DynamoDB.DocumentClient(options);
client.aput = util.promisify(client.put);
client.aget = util.promisify(client.get);
client.aupdate = util.promisify(client.update);
client.ascan = util.promisify(client.scan);

const tables = {
  valuesTable: process.env.VALUES_TABLE,
  groupsTable: process.env.GROUPS_TABLE,
  usersTable: process.env.USERS_TABLE,
  keysTable: process.env.KEYS_TABLE
}

module.exports = { client, tables };
