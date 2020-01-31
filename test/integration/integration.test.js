const app = require('../../index')
const server = require('../support/mockDynamoServer')
const f = require('../support/fixtures')
const fakeMetric = 'ac-current';

beforeAll(async () => await server.start() );
beforeEach(async () => await server.recreateTables() );
afterEach(() => jest.restoreAllMocks() );
afterAll(async () => await server.stop() );

describe('GetGroup', () => {
  it("should get the group from the db and return it", async () => {
    await server.createItem(f.mockDynamoCreateRequest);
    const result = await app.getGroup({pathParameters: {groupId: "FAKEID"}});
    expect(JSON.parse(result.body)).toStrictEqual(f.mockGroup);
    expect(result.statusCode).toEqual(200);
  });

  it("should return 404 if the group doesn't exist", async () => {
    const result = await app.getGroup({pathParameters: {groupId: "FAKEID"}});
    expect(result.statusCode).toEqual(404);
  });

  it("should return 500 if there is an error", async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await app.getGroup({pathParameters: {}});
    expect(result.statusCode).toEqual(500);
    expect(log).toHaveBeenCalled();
  });
});

describe('CreateGroup', () => {
  it("should create the group and redirect to it", async () => {
    const beforeGroups = await server.getAllItems('GROUPS_TABLE');
    expect(beforeGroups.Count).toEqual(0);
    const result = await app.createGroup({body: JSON.stringify(f.mockCreateRequest)});
    expect(result.statusCode).toEqual(302);
    const afterGroups = await server.getAllItems('GROUPS_TABLE');
    expect(afterGroups.Count).toEqual(1);
    expect(result.headers.Location).toEqual(`/groups/${afterGroups.Items[0].id}`);
  });

  it("should return 500 if there is an error", async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await app.createGroup({});
    expect(result.statusCode).toEqual(500);
    expect(log).toHaveBeenCalled();
  });
});

describe('ListGroups', () => {
  it("should list the available groups", async () => {
    await server.createItem(f.mockDynamoCreateRequest);
    await server.createItem(f.mockDynamoCreateRequest2);
    const result = await app.listGroups();
    expect(result.statusCode).toEqual(200);
    const body = JSON.parse(result.body);
    expect(body.length).toBe(2);
    expect(body.map(g => g.id).sort()).toEqual(['FAKEID', 'FAKEIDNEW'])
  });

  describe('UpdateGroup', () => {
    it("should update the group in the database", async () => {
      await server.createItem(f.mockDynamoCreateRequest);
      const result = await app.updateGroup({pathParameters: {groupId: "FAKEID"}, body: JSON.stringify(f.mockGroup2)});
      expect(result.statusCode).toEqual(204);
      const dbGroup = (await server.getAllItems('GROUPS_TABLE')).Items[0];
      expect(dbGroup).toStrictEqual(f.updatedDynamoGroup);
    });
  
    it("should return 404 if the group doesn't exist", async () => {
      const result = await app.updateGroup({pathParameters: {groupId: "FAKEID"}, body: JSON.stringify(f.mockCreateRequest)});
      expect(result.statusCode).toEqual(404);
    });
  
    it("should return 500 if there is an error", async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await app.updateGroup({pathParameters: {}});
      expect(result.statusCode).toEqual(500);
      expect(log).toHaveBeenCalled();
    });
  });

  describe('CreateMetrics', () => {
    it("add values to the history and update the group", async () => {
      await server.createItem(f.mockDynamoCreateRequest);
      const result = await app.createMetrics({pathParameters: {groupId: "FAKEID"}, body: JSON.stringify(f.bulkMetrics)});
      expect(result.statusCode).toEqual(204);
      const dbGroup = (await server.getAllItems('GROUPS_TABLE')).Items[0];
      const dbValues = (await server.getAllItems('VALUES_TABLE')).Items;
      expect(dbGroup).toStrictEqual(f.updatedDynamoItem);
      expect(dbValues).toStrictEqual(f.dynamoValuesList);
    });
  
    it("should return 404 if the group doesn't exist", async () => {
      const result = await app.createMetrics({pathParameters: {groupId: "FAKEID"}, body: JSON.stringify(f.bulkMetrics)});
      expect(result.statusCode).toEqual(404);
    });
  
    it("should return 500 if there is an error", async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await app.createMetrics({pathParameters: {}});
      expect(result.statusCode).toEqual(500);
      expect(log).toHaveBeenCalled();
    });
  });

  describe('GetMetric', () => {
    it("should get the values from the database", async () => {
      await server.createItem(f.mockDynamoCreateRequest);
      const dynamoValues = f.generateDynamoValuesList(3);
      for(let Item of dynamoValues){
        await server.createItem({TableName: 'VALUES_TABLE', Item});
      }
      const result = await app.getMetric({pathParameters: {groupId: "FAKEID", metricId: fakeMetric}});
      expectedResult = dynamoValues.map(val => { return {time: val.metricTime, value: val.metricValues[fakeMetric]}}).reverse()
      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toStrictEqual(expectedResult);
    });
  
    it("should return 404 if the group doesn't exist", async () => {
      const result = await app.getMetric({pathParameters: {groupId: "FAKEID", metricId: fakeMetric}});
      expect(result.statusCode).toEqual(404);
    });
  
    it("should return 500 if there is an error", async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await app.getMetric({pathParameters: {}});
      expect(result.statusCode).toEqual(500);
      expect(log).toHaveBeenCalled();
    });
  });
});