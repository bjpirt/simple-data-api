module.exports = () => {
  const tables = {
    valuesTable: process.env.VALUES_TABLE,
    groupsTable: process.env.GROUPS_TABLE
  };

  if (process.env.IS_OFFLINE) {
    return {
      options: {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'AWS_ACCESS_KEY_ID',
        secretAccessKey: 'AWS_SECRET_ACCESS_KEY'
      },
      tables
    };
  } else if (process.env.JEST_WORKER_ID) {
    tables.valuesTable = 'VALUES_TABLE';
    tables.groupsTable = 'GROUPS_TABLE';
    return {
      options: {
        region: 'localhost',
        endpoint: 'http://localhost:8100',
        sslEnabled: false,
      },
      tables
    };
  } else {
    return {
      options: {},
      tables
    }
  }
}
