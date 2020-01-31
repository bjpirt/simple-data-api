module.exports = {
  mockCreateRequest: {
    "name": "Dummy",
    "metrics": {
        "ac-power": {
            "unit": "W",
            "time": "2020-01-16T08:21:57Z",
            "value": 83
        },
        "ac-current": {
            "unit": "A",
            "time": "2020-01-16T08:21:57Z",
            "value": 6.2
        }
    }
  },
  mockGroup: {
    "id": "FAKEID",
    "name": "Dummy",
    "metrics": {
        "ac-power": {
            "unit": "W",
            "time": "2020-01-16T08:21:57Z",
            "value": 83
        },
        "ac-current": {
            "unit": "A",
            "time": "2020-01-16T08:21:57Z",
            "value": 6.2
        }
    }
  },
  mockGroup2: {
    "id": "FAKEID",
    "name": "NewName",
    "metrics": {
        "ac-power": {
            "unit": "kW",
            "time": "2020-01-17T08:21:57Z",
            "value": 90
        },
        "ac-current": {
            "unit": "mA",
            "time": "2020-01-17T08:21:57Z",
            "value": 7.2
        }
    }
  },
  mockGroupNoName: {
    "metrics": {
        "ac-power": {
            "time": "2020-01-16T08:21:57Z",
            "value": 83
        }
    }
  },
  mockCreateRequestNoUnits: {
    "name": "Dummy",
    "metrics": {
        "ac-power": {
            "time": "2020-01-16T08:21:57Z",
            "value": 83
        },
        "ac-current": {
            "time": "2020-01-16T08:21:57Z",
            "value": 6.2
        }
    }
  },
  mockCreateRequestNoTime: {
    "name": "Dummy",
    "metrics": {
        "ac-power": {
            "value": 83
        },
        "ac-current": {
            "value": 6.2
        }
    }
  },
  mockGroupPlusTimes: (t) => {
    return {
      "name": "Dummy",
      "metrics": {
          "ac-power": {
              "value": 83,
              "time": t.toISOString()
          },
          "ac-current": {
              "value": 6.2,
              "time": t.toISOString()
          }
      }
    }
  },
  mockCreateRequestOnlyUnits: {
    "name": "Dummy",
    "metrics": {
        "ac-power": {
            "unit": "W"
        },
        "ac-current": {
            "unit": "A"
        }
    }
  },
  mockGroupNoMetrics: {
    "id": "FAKEID",
    "name": "Dummy",
    "metrics": {}
  },
  mockGroupMetricsMissing: {
    "id": "FAKEID",
    "name": "Dummy"
  },
  mockCreateRequestOnlyName: {
    "name": "Dummy"
  },
  mockemptyGroup: {
    id: "FAKEID",
    metrics: {}
  },
  mockDynamoCreateRequest: {
    Item: {
      id: "FAKEID",
      metricUnits: {
        "ac-current": "A",
        "ac-power": "W",
      },
      metricValues: {
        "ac-current": {
          time: "2020-01-16T08:21:57Z",
          value: 6.2,
        },
        "ac-power": {
          time: "2020-01-16T08:21:57Z",
          value: 83,
        },
      },
      groupName: "Dummy",
    },
    TableName: "GROUPS_TABLE",
    ConditionExpression: 'attribute_not_exists(metricValues)'
  },
  updatedDynamoItem: {
    id: "FAKEID",
    metricUnits: {
      "ac-current": "A",
      "ac-power": "W",
    },
    metricValues: {
      "ac-current": {
        time: "2020-01-16T09:21:57Z",
        value: 5,
      },
      "ac-power": {
        time: "2020-01-16T09:21:57Z",
        value: 4,
      },
    },
    groupName: "Dummy",
  },
  mockDynamoCreateRequest2: {
    Item: {
      id: "FAKEIDNEW",
      metricUnits: {
        "ac-current": "A",
        "ac-power": "W",
      },
      metricValues: {
        "ac-current": {
          time: "2020-01-16T08:21:57Z",
          value: 6.2,
        },
        "ac-power": {
          time: "2020-01-16T08:21:57Z",
          value: 83,
        },
      },
      groupName: "Dummy",
    },
    TableName: "GROUPS_TABLE",
    ConditionExpression: 'attribute_not_exists(metricValues)'
  },
  mockDynamoCreateRequestNoUnits: {
    Item: {
      id: "FAKEID",
      metricUnits: {},
      metricValues: {
        "ac-current": {
          time: "2020-01-16T08:21:57Z",
          value: 6.2,
        },
        "ac-power": {
          time: "2020-01-16T08:21:57Z",
          value: 83,
        },
      },
      groupName: "Dummy",
    },
    TableName: "GROUPS_TABLE",
    ConditionExpression: 'attribute_not_exists(metricValues)'
  },
  mockDynamoCreateRequestOnlyUnits: {
    Item: {
      id: "FAKEID",
      metricUnits: {
        "ac-current": "A",
        "ac-power": "W",
      },
      metricValues: {
        "ac-current": {},
        "ac-power": {},
      },
      groupName: "Dummy",
    },
    TableName: "GROUPS_TABLE",
    ConditionExpression: 'attribute_not_exists(metricValues)'
  },
  mockHistory: [
    {"time": "2020-01-16T08:21:57Z", "value": 83},
    {"time": "2020-01-16T08:21:57Z", "value": 6.2}
  ],
  mockDynamoUnmatchedItem: {
    id: "FAKEID",
    metricUnits: {
      "ac-current": "A",
      "ac-power": "W",
    },
    metricValues: {
      "ac-current": {
        time: "2020-01-16T08:21:57Z",
        value: 6.2
      },
      "temperature": {
        time: "2020-01-16T08:21:57Z",
        value: 6.2
      }
    },
    groupName: "Dummy",
  },
  mockDynamoNoMetricsItem: {
    "id": "FAKEID",
    "metricUnits": {},
    "metricValues": {},
    "groupName": "Dummy",
  },
  mockDynamoEmptyItem: {
    "id": "FAKEID",
    "metricUnits": {},
    "metricValues": {},
    "groupName": undefined,
  },
  mockUnmatchedGroup: {
    "id": "FAKEID",
    "name": "Dummy",
    "metrics": {
        "ac-power": {
            "unit": "W"
        },
        "ac-current": {
            "unit": "A",
            "time": "2020-01-16T08:21:57Z",
            "value": 6.2
        },
        "temperature": {
            "time": "2020-01-16T08:21:57Z",
            "value": 6.2
        }
    }
  },
  mockDynamoUpdateGroup: {
    TableName: 'GROUPS_TABLE',
    Key: { id: 'FAKEID' },
    UpdateExpression: 'SET groupName = :name, metricValues.#metricName0 = :metricValue0, metricUnits.#metricName0 = :unitValue0, metricValues.#metricName1 = :metricValue1, metricUnits.#metricName1 = :unitValue1',
    ExpressionAttributeNames: { '#metricName0': 'ac-power', '#metricName1': 'ac-current' },
    ExpressionAttributeValues: {
      ':name': 'Dummy',
      ':metricValue0': { time: '2020-01-16T08:21:57Z', value: 83 },
      ':unitValue0': 'W',
      ':metricValue1': { time: '2020-01-16T08:21:57Z', value: 6.2 },
      ':unitValue1': 'A'
    },
    ConditionExpression: "attribute_exists(metricValues)"
  },
  mockDynamoUpdateGroupNoUnits: {
    TableName: 'GROUPS_TABLE',
    Key: { id: 'FAKEID' },
    UpdateExpression: 'SET groupName = :name, metricValues.#metricName0 = :metricValue0, metricValues.#metricName1 = :metricValue1',
    ExpressionAttributeNames: { '#metricName0': 'ac-power', '#metricName1': 'ac-current' },
    ExpressionAttributeValues: {
      ':name': 'Dummy',
      ':metricValue0': { time: '2020-01-16T08:21:57Z', value: 83 },
      ':metricValue1': { time: '2020-01-16T08:21:57Z', value: 6.2 }
    },
    ConditionExpression: "attribute_exists(metricValues)"
  },
  mockDynamoUpdateGroupOnlyUnits: {
    TableName: 'GROUPS_TABLE',
    Key: { id: 'FAKEID' },
    UpdateExpression: 'SET groupName = :name, metricUnits.#metricName0 = :unitValue0, metricUnits.#metricName1 = :unitValue1',
    ExpressionAttributeNames: { '#metricName0': 'ac-power', '#metricName1': 'ac-current' },
    ExpressionAttributeValues: { ':name': 'Dummy', ':unitValue0': 'W', ':unitValue1': 'A' },
    ConditionExpression: "attribute_exists(metricValues)"
  },
  mockDynamoUpdateGroupNoName: {
    TableName: 'GROUPS_TABLE',
    Key: { id: 'FAKEID' },
    UpdateExpression: 'SET metricValues.#metricName0 = :metricValue0',
    ExpressionAttributeNames: { '#metricName0': 'ac-power' },
    ExpressionAttributeValues: { ':metricValue0': { "time": "2020-01-16T08:21:57Z", "value": 83 }},
    ConditionExpression: "attribute_exists(metricValues)"
  },
  mockDynamoUpdateGroupNoMetrics: {
    TableName: 'GROUPS_TABLE',
    Key: { id: 'FAKEID' },
    UpdateExpression: 'SET groupName = :name',
    ExpressionAttributeNames: { },
    ExpressionAttributeValues: { ':name': 'Dummy' },
    ConditionExpression: "attribute_exists(metricValues)"
  },
  updatedDynamoGroup: {
    "groupName": "NewName",
    "id": "FAKEID",
    "metricUnits": {
      "ac-current": "mA",
      "ac-power": "kW",
    },
    "metricValues": {
      "ac-current": {
        "time": "2020-01-17T08:21:57Z",
        "value": 7.2,
      },
      "ac-power": {
        "time": "2020-01-17T08:21:57Z",
        "value": 90,
      }
    }
  },
  bulkMetrics: {
    values: {
      '2020-01-16T08:21:57Z': [1, 2],
      '2020-01-16T09:21:57Z': [4, 5]
    },
    columns: ['ac-power', 'ac-current']
  },
  individualMetrics: [
    {"metric": "ac-power", "time": "2020-01-16T08:21:57Z", "value": 1},
    {"metric": "ac-current", "time": "2020-01-16T08:21:57Z", "value": 2},
    {"metric": "ac-power", "time": "2020-01-16T09:21:57Z", "value": 4},
    {"metric": "ac-current", "time": "2020-01-16T09:21:57Z", "value": 5}
  ],
  bulkGroupUpdate: {
    metrics: {
      "ac-power": {
        time: "2020-01-16T09:21:57Z",
        value: 4
      },
      "ac-current": {
        time: "2020-01-16T09:21:57Z",
        value: 5
      }
    }
  },
  bulkMetricsNewMetric: {
    values: {
      '2020-01-16T08:21:57Z': [1],
      '2020-01-16T09:21:57Z': [4]
    },
    columns: ['temperature']
  },
  individualMetricsNewMetric: [
    {"metric": "temperature", "time": "2020-01-16T08:21:57Z", "value": 1},
    {"metric": "temperature", "time": "2020-01-16T09:21:57Z", "value": 4}
  ],
  bulkGroupUpdateNewMetric: {
    metrics: {
      "temperature": {
        time: "2020-01-16T09:21:57Z",
        value: 4
      }
    }
  },
  bulkMetricsOldTime: {
    values: {
      '2020-01-15T09:21:57Z': [4]
    },
    columns: ['ac-power']
  },
  individualMetricsOldTime: [
    {"metric": "ac-power", "time": "2020-01-15T09:21:57Z", "value": 4}
  ],
  bulkMetricsPartialNew: {
    values: {
      '2020-01-15T08:21:57Z': [1],
      '2020-01-16T10:22:57Z': [2],
      '2020-01-16T10:21:57Z': [3]
    },
    columns: ['ac-power']
  },
  bulkGroupUpdatePartialNew: {
    metrics: {
      "ac-power": {
        time: "2020-01-16T10:22:57Z",
        value: 2
      }
    }
  },
  mockValues: [
    {"time": "2020-01-16T08:21:57Z", "value": 1},
    {"time": "2020-01-16T09:22:07Z", "value": 2},
    {"time": "2020-01-16T09:22:17Z", "value": 3},
    {"time": "2020-01-16T09:22:27Z", "value": 4},
    {"time": "2020-01-16T09:22:37Z", "value": 5},
    {"time": "2020-01-16T09:22:47Z", "value": 6},
    {"time": "2020-01-16T09:22:57Z", "value": 7},
    {"time": "2020-01-16T09:23:07Z", "value": 8},
    {"time": "2020-01-16T09:23:17Z", "value": 9},
    {"time": "2020-01-16T09:23:27Z", "value": 10}
  ],
  mockGroupedValues: [
    {"time": "2020-01-16T08:21:00.000Z", "value": 1},
    {"time": "2020-01-16T09:22:00.000Z", "value": 4.5},
    {"time": "2020-01-16T09:23:00.000Z", "value": 9},
  ],
  groupList: [
    {
      id: "FAKE-ONE",
      name: "one",
      metrics: {
        "ac-power": {
          time: "2020-01-16T08:21:00.000Z",
          value: 1,
          unit: 'W'
        },
        "dc-power": {
          time: "2020-01-16T08:21:00.000Z",
          value: 2
        }
      }
    },
    {
      id: "FAKE-TWO",
      name: "two",
      metrics: {
        temperature: {
          time: "2020-01-17T08:21:00.000Z",
          value: 1
        },
        humidity: {
          time: "2020-01-17T08:21:00.000Z",
          value: 2,
          unit: '%'
        }
      }
    },
  ],
  groupSingle:{
    id: "FAKE-ONE",
    name: "one",
    metrics: {
      "ac-power": {
        time: "2020-01-16T08:21:00.000Z",
        value: 1,
        unit: 'W'
      },
      "dc-power": {
        time: "2020-01-16T08:21:00.000Z",
        value: 2
      }
    }
  },
  groupDynamoList: {
    Items: [
      {
        id: "FAKE-ONE",
        groupName: 'one',
        metricUnits: {"ac-power": 'W'},
        metricValues: {
          "ac-power": {
            time: "2020-01-16T08:21:00.000Z",
            value: 1
          },
          "dc-power": {
            time: "2020-01-16T08:21:00.000Z",
            value: 2
          }
        }
      },
      {
        id: "FAKE-TWO",
        groupName: 'two',
        metricUnits: {humidity: '%'},
        metricValues: {
          temperature: {
            time: "2020-01-17T08:21:00.000Z",
            value: 1
          },
          humidity: {
            time: "2020-01-17T08:21:00.000Z",
            value: 2
          }
        }
      }
    ]
  },
  groupDynamoSingle: {
    Item: {
      id: "FAKE-ONE",
      groupName: 'one',
      metricUnits: {"ac-power": 'W'},
      metricValues: {
        "ac-power": {
          time: "2020-01-16T08:21:00.000Z",
          value: 1
        },
        "dc-power": {
          time: "2020-01-16T08:21:00.000Z",
          value: 2
        }
      }
    }
  },
  dynamoValueList: {
    Items: [
      {
        metricTime: "2020-01-16T09:21:00.000Z",
        metricValues: {
          "ac-power": 3
        }
      },
      {
        metricTime: "2020-01-16T10:21:00.000Z",
        metricValues: {
          "ac-power": 4
        }
      }
    ]
  },
  valueList: [
    {
      time: "2020-01-16T09:21:00.000Z",
      value: 3
    },
    {
      time: "2020-01-16T10:21:00.000Z",
      value: 4
    }
  ],
  createValuesSingleTime: [
    {
      metric: "ac-power",
      time: "2020-01-16T09:21:00.000Z",
      value: 3
    },
    {
      metric: "dc-power",
      time: "2020-01-16T09:21:00.000Z",
      value: 4
    }
  ],
  createValuesSingleTimeDynamoRequest: {
    ConditionExpression: "attribute_not_exists(metricValues)",
    Item: {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:21:00.000Z",
      "metricValues": {
        "ac-power": 3,
        "dc-power": 4,
      },
    },
    "Key": {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:21:00.000Z",
    },
    "TableName": "VALUES_TABLE"
  },
  createValuesMultipleTime: [
    {
      metric: "ac-power",
      time: "2020-01-16T09:21:00.000Z",
      value: 3
    },
    {
      metric: "dc-power",
      time: "2020-01-16T09:22:00.000Z",
      value: 4
    }
  ],
  createValuesMultiTimeDynamoRequest1: {
    ConditionExpression: "attribute_not_exists(metricValues)",
    Item: {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:21:00.000Z",
      "metricValues": {
        "ac-power": 3,
      },
    },
    "Key": {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:21:00.000Z",
    },
    "TableName": "VALUES_TABLE"
  },
  createValuesMultiTimeDynamoRequest2: {
    ConditionExpression: "attribute_not_exists(metricValues)",
    Item: {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:22:00.000Z",
      "metricValues": {
        "dc-power": 4,
      },
    },
    Key: {
      groupId: "FAKEID",
      metricTime: "2020-01-16T09:22:00.000Z",
    },
    TableName: "VALUES_TABLE"
  },
  createValuesSingleTimeItem: {
    groupId: "FAKEID",
    metricTime: "2020-01-16T09:21:00.000Z",
    metricValues: {
      "ac-power": 3,
      "dc-power": 4
    }
  },
  createValuesMultiTimeItem1: {
    groupId: "FAKEID",
    metricTime: "2020-01-16T09:21:00.000Z",
    metricValues: {
      "ac-power": 3
    }
  },
  createValuesMultiTimeItem2: {
    groupId: "FAKEID",
    metricTime: "2020-01-16T09:22:00.000Z",
    metricValues: {
      "dc-power": 4
    }
  },
  updateValuesDynamoRequest: {
    ExpressionAttributeNames: {
        "#metricName0": "ac-power",
        "#metricName1": "dc-power",
    },
    ExpressionAttributeValues: {
      ":metricValue0": 3,
      ":metricValue1": 4
    },
    Key: {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:21:00.000Z",
    },
    UpdateExpression: "SET metricValues.#metricName0 = :metricValue0, metricValues.#metricName1 = :metricValue1",
    TableName: "VALUES_TABLE"
  },
  dynamoValuesList: [
    {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T08:21:57Z",
      "metricValues": {
        "ac-current": 2,
        "ac-power": 1,
      },
    },
    {
      "groupId": "FAKEID",
      "metricTime": "2020-01-16T09:21:57Z",
      "metricValues": {
        "ac-current": 5,
        "ac-power": 4,
      },
    }
  ],
  generateDynamoValuesList: (count) => {
    count = count || 10;
    const output = [];
    const now = new Date();
    for(let i = 0; i< count; i++){
      output.push({
        "groupId": "FAKEID",
        "metricTime": (new Date(now - i * 60000)).toISOString(),
        "metricValues": {
          "ac-current": i
        },
      })
    }
    return output;
  },
  updateException: {
    message: 'The conditional request failed',
    code: 'ConditionalCheckFailedException',
    time: new Date(),
    requestId: '9913cf1f-2718-409d-94d1-019c54376c26',
    statusCode: 400,
    retryable: false,
    retryDelay: 27.665121437563258
  }
}