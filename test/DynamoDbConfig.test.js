const dbConfig = require('../lib/DynamoDbConfig');
const VALUES_TABLE = 'VALUES_TABLE', GROUPS_TABLE = 'GROUPS_TABLE';

describe('DynamoDbConfig', () => {
  it("should return the correct data if not running offline", async () => {
    const config = dbConfig({ VALUES_TABLE, GROUPS_TABLE });
    expect(config).toStrictEqual({
      dbConfig: {},
      tables: {
        valuesTable: VALUES_TABLE,
        groupsTable: GROUPS_TABLE
      }
    })
  });

  it("should return the correct data if running offline", async () => {
    const config = dbConfig({ VALUES_TABLE, GROUPS_TABLE, IS_OFFLINE: true });
    expect(config).toStrictEqual({
      dbConfig: {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'AWS_ACCESS_KEY_ID',
        secretAccessKey: 'AWS_SECRET_ACCESS_KEY'
      },
      tables: {
        valuesTable: VALUES_TABLE,
        groupsTable: GROUPS_TABLE
      }
    })
  });

  it("should return the correct data if running in test", async () => {
    const config = dbConfig({ VALUES_TABLE, GROUPS_TABLE, JEST_WORKER_ID: process.env.JEST_WORKER_ID });
    expect(config).toStrictEqual({
      dbConfig: {
        region: 'localhost',
        endpoint: 'http://localhost:8100',
        sslEnabled: false
      },
      tables: {
        valuesTable: VALUES_TABLE,
        groupsTable: GROUPS_TABLE
      }
    })
  });
})
