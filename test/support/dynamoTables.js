module.exports = {
  tables: [
    {
      "TableName": "VALUES_TABLE",
      "KeySchema": [
        { "AttributeName": "groupId", "KeyType": "HASH" },
        { "AttributeName": "metricTime", "KeyType": "RANGE" }
      ],
      "AttributeDefinitions": [
        { "AttributeName": "groupId", "AttributeType": "S" },
        { "AttributeName": "metricTime", "AttributeType": "S" }
      ],
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 1,
        "WriteCapacityUnits": 1
      }
    },
    {
      "TableName": "GROUPS_TABLE",
      "KeySchema": [
        { "AttributeName": "id", "KeyType": "HASH" }
      ],
      "AttributeDefinitions": [
        { "AttributeName": "id", "AttributeType": "S" }
      ],
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 1,
        "WriteCapacityUnits": 1
      }
    }
  ]
}