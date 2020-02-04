'use strict';
const util = require('util');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = (config) => {
  const client = new AWS.DynamoDB.DocumentClient(config.dbConfig);
  client.aput = util.promisify(client.put);
  client.aget = util.promisify(client.get);
  client.aupdate = util.promisify(client.update);
  client.ascan = util.promisify(client.scan);
  client.aquery = util.promisify(client.query);

  return { client, tables: config.tables };
}

