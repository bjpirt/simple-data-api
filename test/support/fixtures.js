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
  mockCreateRequestOnlyName: {
    "name": "Dummy"
  },
  mockDynamoCreateRequest: {
    "Item": {
      "id": "FAKEID",
      "metricUnits": {
        "ac-current": "A",
        "ac-power": "W",
      },
      "metricValues": {
        "ac-current": {
          "time": "2020-01-16T08:21:57Z",
          "value": 6.2,
        },
        "ac-power": {
          "time": "2020-01-16T08:21:57Z",
          "value": 83,
        },
      },
      "name": "Dummy",
    },
    "TableName": "GROUPS_TABLE"
  },
  mockDynamoCreateRequestNoUnits: {
    "Item": {
      "id": "FAKEID",
      "metricUnits": {},
      "metricValues": {
        "ac-current": {
          "time": "2020-01-16T08:21:57Z",
          "value": 6.2,
        },
        "ac-power": {
          "time": "2020-01-16T08:21:57Z",
          "value": 83,
        },
      },
      "name": "Dummy",
    },
    "TableName": "GROUPS_TABLE"
  },
  mockDynamoCreateRequestOnlyUnits: {
    "Item": {
      "id": "FAKEID",
      "metricUnits": {
        "ac-current": "A",
        "ac-power": "W",
      },
      "metricValues": {
        "ac-current": {},
        "ac-power": {},
      },
      "name": "Dummy",
    },
    "TableName": "GROUPS_TABLE"
  }
}