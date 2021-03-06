
let config, dynamo;
const f = require('../support/fixtures')
const fakeId = 'FAKEID';
const fakeKeyId = "FAKEGROUPKEY";
const fakeMetric = 'ac-power';

describe('Dynamo Gateway', () => {

  beforeEach(() => {
    config = require('../support/mockDynamoDbConnection')
    dynamo = require('../../lib/gateways/Dynamo')(config);
  });

  describe('createGroup', () => {
    beforeEach(() => {
      dynamo.generateGroupId = jest.fn();
      dynamo.generateGroupId.mockReturnValue("FAKEID");
    });

    it("should pass through the data to the connection", async () => {
      await dynamo.createGroup(f.mockCreateRequest);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequest);
    });

    it("should work if no units are present", async () => {
      await dynamo.createGroup(f.mockCreateRequestNoUnits);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequestNoUnits);
    });

    it("should still add units if no time and value are present", async () => {
      await dynamo.createGroup(f.mockCreateRequestOnlyUnits);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequestOnlyUnits);
    });

    it("retry if the group id already exists", async () => {
      dynamo.generateGroupId = jest.fn();
      dynamo.generateGroupId
        .mockReturnValueOnce("FAKEID")
        .mockReturnValueOnce("FAKEIDNEW");
      config.client.aput
        .mockImplementationOnce(() => { throw(f.updateException) } )
      await dynamo.createGroup(f.mockCreateRequest);
      expect(config.client.aput).toHaveBeenCalledTimes(2);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequest);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequest2);
    });

    it("should throw an error if dynamo raises an unknown error", async () => {
      let exception = null;
      let dummyException = {code: 'Unknown'}
      config.client.aput = jest.fn(() => { throw(dummyException) });

      try{
        await dynamo.createGroup(f.mockCreateRequest);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe(dummyException)
      config.client.aput = jest.fn();
    });
  });

  describe('updateGroup', () => {
    it("should pass through the correct data to the connection", async () => {
      await dynamo.updateGroup('FAKEID', f.mockGroup);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroup);
    });

    it("should pass through the correct data to the connection if no units", async () => {
      await dynamo.updateGroup('FAKEID', f.mockCreateRequestNoUnits);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroupNoUnits);
    });

    it("should pass through the correct data to the connection if only units", async () => {
      await dynamo.updateGroup('FAKEID', f.mockCreateRequestOnlyUnits);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroupOnlyUnits);
    });

    it("doesn't set the name if it is not passed in", async () => {
      await dynamo.updateGroup('FAKEID', f.mockGroupNoName);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroupNoName);
    });

    it("works if no metrics are passed in", async () => {
      await dynamo.updateGroup('FAKEID', f.mockGroupNoMetrics);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroupNoMetrics);
    });

    it("should raise an error if the group was not found", async () => {
      let exception = null;
      config.client.aupdate = jest.fn(() => {
        throw(f.updateException);
      });
      try{
        await dynamo.updateGroup('BADID', f.mockCreateRequestOnlyUnits);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe('NotFoundException')
      config.client.aupdate = jest.fn();
    });

    it("should raise an error if it was unexpected", async () => {
      let exception = null;
      let dummyException = {code: 'Unknown'}
      config.client.aupdate = jest.fn(() => {
        throw(dummyException);
      });
      try{
        await dynamo.updateGroup('FAKEID', f.mockCreateRequestOnlyUnits);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe(dummyException)
      config.client.aupdate = jest.fn();
    });
  });

  describe('generateGroupId', () => {
    it("should return a random string", async () => {
      let groupId = dynamo.generateGroupId();
      expect(groupId).toMatch(/^[a-z0-9]{8}$/);
    });
  });

  describe('listGroups', () => {
    it("should return the formatted groups from Dynamo", async () => {
      config.client.ascan.mockReturnValue(f.groupDynamoList)
      const result = await dynamo.listGroups();
      expect(config.client.ascan).toHaveBeenCalledWith({TableName: config.tables.groupsTable});
      expect(result).toEqual(f.groupList);
    });
  });

  describe('getGroup', () => {
    it("should return the formatted group from Dynamo", async () => {
      config.client.aget.mockReturnValue(f.groupDynamoSingle)
      const result = await dynamo.getGroup(fakeId);
      expect(config.client.aget).toHaveBeenCalledWith({TableName: config.tables.groupsTable, Key: {id: fakeId}});
      expect(result).toEqual(f.groupSingle);
    });

    it("should return falsy if the group was not found", async () => {
      config.client.aget.mockReturnValue({})
      const result = await dynamo.getGroup(fakeId);
      expect(result).toBeFalsy();
    });
  });

  describe('createGroupKey', () => {
    it("should create a key for the group", async () => {
      const keyData = {name: 'Name', methods: ['*']};
      await dynamo.createGroupKey(fakeId, keyData)
      expect(config.client.aupdate).toHaveBeenCalledWith({
        TableName: 'GROUPS_TABLE',
        Key: { id: fakeId },
        UpdateExpression: 'SET groupKeys.#keyId = :keyData',
        ExpressionAttributeNames: {'#keyId': keyData.id },
        ExpressionAttributeValues: { ':keyData': keyData},
        ConditionExpression: 'attribute_exists(groupKeys) AND attribute_not_exists(groupKeys.#keyId)'
      });
    });
  });

  describe('listGroupKeys', () => {
    it("should list the keys for the group", async () => {
      const item = {Item: { groupKeys: { keyid1: { name: "Key one" }, keyid2: { name: "Key two" }}}}
      config.client.aget.mockReturnValue(item)
      const result = await dynamo.listGroupKeys(fakeId);
      expect(config.client.aget).toHaveBeenCalledWith({Key: { id: fakeId }, TableName: config.tables.groupsTable});
      expect(result).toEqual([{ name: "Key one" }, { name: "Key two" }]);
    });

    it("should return undefined if the group doesn't exist", async () => {
      config.client.aget.mockReturnValue({})
      const result = await dynamo.listGroupKeys(fakeId);
      expect(config.client.aget).toHaveBeenCalledWith({Key: { id: fakeId }, TableName: config.tables.groupsTable});
      expect(result).toBeUndefined();
    });
  });

  describe('deleteGroupKey', () => {
    it("should make the correct call to dynamo", async () => {
      await dynamo.deleteGroupKey(fakeId, fakeKeyId);
      expect(config.client.aupdate).toHaveBeenCalledWith({
        TableName: 'GROUPS_TABLE',
        Key: { id: fakeId },
        UpdateExpression: 'REMOVE groupKeys.#keyId',
        ExpressionAttributeNames: {'#keyId': fakeKeyId },
        ConditionExpression: 'attribute_exists(groupKeys.#keyId)'
      });
    });

    it("should raise a not found exception if the group does not exist", async () => {
      config.client.aupdate = jest.fn(() => {
        throw(f.updateException);
      });
      try{
        await dynamo.deleteGroupKey(fakeId, fakeKeyId);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe("NotFoundException")
      config.client.aupdate = jest.fn();
    });

    it("should raise other types of exceptions", async () => {
      const dummyException = {code: 'dummmy'};
      config.client.aupdate = jest.fn(() => {
        throw(dummyException);
      });
      try{
        await dynamo.deleteGroupKey(fakeId, fakeKeyId);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe(dummyException)
      config.client.aupdate = jest.fn();
    });
  });

  describe('updateValues', () => {
    it("should update a record with the correct values", async () => {
      await dynamo.updateValues(f.createValuesSingleTimeItem);
      expect(config.client.aupdate).toBeCalledWith(f.updateValuesDynamoRequest);
    });
  });

  describe('createValues', () => {
    it("should insert a new record for the values with a single time", async () => {
      await dynamo.createValues(fakeId, f.createValuesSingleTime);
      expect(config.client.aput).toBeCalledWith(f.createValuesSingleTimeDynamoRequest);
    });

    it("should insert multiple new records for values with multiple times", async () => {
      await dynamo.createValues(fakeId, f.createValuesMultipleTime);
      expect(config.client.aput).toHaveReturnedTimes(2);
      expect(config.client.aput).toBeCalledWith(f.createValuesMultiTimeDynamoRequest1);
      expect(config.client.aput).toBeCalledWith(f.createValuesMultiTimeDynamoRequest2);
    });

    it("should update a record if it already exists", async () => {
      config.client.aput = jest.fn(() => {
        throw(f.updateException);
      });
      dynamo.updateValues = jest.fn();
      await dynamo.createValues(fakeId, f.createValuesSingleTime);
      expect(config.client.aput).toBeCalledWith(f.createValuesSingleTimeDynamoRequest);
      expect(dynamo.updateValues).toBeCalledWith(f.createValuesSingleTimeItem);
    });

    it("should update multiple records if they already exist", async () => {
      config.client.aput = jest.fn(() => {
        throw(f.updateException);
      });
      dynamo.updateValues = jest.fn();
      await dynamo.createValues(fakeId, f.createValuesMultipleTime);
      expect(dynamo.updateValues).toHaveReturnedTimes(2);
      expect(dynamo.updateValues).toBeCalledWith(f.createValuesMultiTimeItem1);
      expect(dynamo.updateValues).toBeCalledWith(f.createValuesMultiTimeItem2);
      config.client.aput = jest.fn();
    });

    it("should raise an error if it was unexpected", async () => {
      let exception = null;
      let dummyException = {code: 'Unknown'}
      config.client.aput = jest.fn(() => {
        throw(dummyException);
      });
      try{
        await dynamo.createValues(fakeId, f.createValuesSingleTime);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe(dummyException)
      config.client.aput = jest.fn();
    });

  });

  describe('getMetric', () => {
    it("should return the formatted values from Dynamo and pass through the correct query", async () => {
      config.client.aquery.mockReturnValue(f.dynamoValueList)
      const result = await dynamo.getMetric(fakeId, fakeMetric, {start: new Date(Date.parse('2020-01-16T08:21:00.000Z')), end: new Date(Date.parse('2020-01-17T08:21:00.000Z'))});
      expect(config.client.aquery).toHaveBeenCalledWith({
        TableName: config.tables.valuesTable,
        KeyConditionExpression: 'groupId = :groupId and metricTime BETWEEN :start AND :end',
        ProjectionExpression: 'metricTime, metricValues.#metricName',
        FilterExpression: 'attribute_exists (metricValues.#metricName)',
        ExpressionAttributeValues: {':groupId': fakeId, ':start': '2020-01-16T08:21:00.000Z', ':end': '2020-01-17T08:21:00.000Z'},
        ExpressionAttributeNames: {'#metricName': fakeMetric}
      });
      expect(result).toEqual(f.valueList);
    });
  });
});
