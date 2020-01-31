const dynalite = require('dynalite');
const dynaliteServer = dynalite({
  createTableMs: 0,
  deleteTableMs: 0,
  updateTableMs: 0
});
const AWS = require('aws-sdk');
const { tables } = require('./dynamoTables');

MockServer = {
  start: (cb, port) => {
    port = port || 8100;
    return new Promise(resolve =>
      dynaliteServer.listen(port, resolve)
    );
  },

  stop: async () => {
    return new Promise(resolve => dynaliteServer.close(() => resolve()));
  },

  createTables: async (port) => {
    port = port || 8100;
    const dynamo = new AWS.DynamoDB({endpoint: 'http://localhost:8100', region: 'region'})

    await Promise.all(tables.map(table => dynamo.createTable(table).promise()));
    await Promise.all(
      tables.map(table =>
        dynamo.waitFor("tableExists", { TableName: table.TableName }).promise()
      )
    );
  },

  deleteTables: async (port) => {
    port = port || 8100;
    const dynamo = new AWS.DynamoDB({endpoint: 'http://localhost:8100', region: 'region'})

    const existingTables = await dynamo.listTables().promise()
    await Promise.all(
      existingTables.TableNames.map(table =>
        dynamo.deleteTable({ TableName: table }).promise()
      )
    );
    await Promise.all(
      existingTables.TableNames.map(table =>
        dynamo
          .waitFor("tableNotExists", { TableName: table })
          .promise()
      )
    );
  },

  recreateTables: async (port) => {
    await MockServer.deleteTables(port);
    await MockServer.createTables(port);
  },

  createItem: async (item, port) => {
    port = port || 8100;
    const client = new AWS.DynamoDB.DocumentClient({endpoint: 'http://localhost:8100', region: 'region'});
    await client.put(item).promise()
  },

  getAllItems: async (table, port) => {
    port = port || 8100;
    const client = new AWS.DynamoDB.DocumentClient({endpoint: 'http://localhost:8100', region: 'region'});
    return client.scan({ TableName : table }).promise();
  }
}

module.exports = MockServer;