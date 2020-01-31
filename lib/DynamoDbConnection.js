'use strict';
const util = require('util');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};

let valuesTable = process.env.VALUES_TABLE;
let groupsTable = process.env.GROUPS_TABLE;
let usersTable = process.env.USERS_TABLE;

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY'
  };
}else if (process.env.JEST_WORKER_ID) {
  options = {
    endpoint: 'localhost:8100',
    sslEnabled: false,
    region: "local-env"
  }
  valuesTable = 'VALUES_TABLE';
  groupsTable = 'GROUPS_TABLE';
  usersTable = 'USERS_TABLE';
}


const client = new AWS.DynamoDB.DocumentClient(options);
client.aput = util.promisify(client.put);
client.aget = util.promisify(client.get);
client.aupdate = util.promisify(client.update);
client.ascan = util.promisify(client.scan);
client.aquery = util.promisify(client.query);

const tables = {
  valuesTable,
  groupsTable,
  usersTable
};

// console.log(process.env)
// console.log(tables)
module.exports = { client, tables };
