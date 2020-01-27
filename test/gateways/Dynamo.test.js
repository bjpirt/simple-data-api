
const config = require('../support/mockDynamoDbConnection')
const dynamo = require('../../lib/gateways/Dynamo')(config);
const f = require('../support/fixtures')
const fakeId = 'FAKEID';
const fakeMetric = 'ac-power';

describe('Dynamo Gateway', () => {

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

  describe('updateValues', () => {
  });

  describe('createValues', () => {
  });

  describe('getValues', () => {
    it("should return the formatted values from Dynamo and pass through the correct query", async () => {
      config.client.aquery.mockReturnValue(f.dynamoValueList)
      const result = await dynamo.getValues(fakeId, fakeMetric, {start: new Date(Date.parse('2020-01-16T08:21:00.000Z')), end: new Date(Date.parse('2020-01-17T08:21:00.000Z'))});
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
