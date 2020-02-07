const dbConfig = require('../../lib/DynamoDbConfig')(process.env);
const dbConn = require('../../lib/DynamoDbConnection')(dbConfig);
const dbGateway = require('../../lib/gateways/Dynamo')(dbConn);
const user = 'testuser';
const pass = 'passw0rd';
const pass_hash = '$2a$12$5MiljTrwVi6Y/CjfjcTrMObsSFnTUV4/LlqoHB8YbeFxhnfBrClNa';
const jwt_secret = 'abc123';
const useCases = require('../../lib/use-cases')({ dbGateway, loginData: {
  user, pass_hash, jwt_secret
}});
const jwt = require('jsonwebtoken');
const app = require('../../lib/handlers')(useCases);
const server = require('../support/mockDynamoServer')
const f = require('../support/fixtures')
const fakeMetric = 'ac-current';
const fakeId = "FAKEID";

beforeAll(async () => await server.start() );
beforeEach(async () => await server.recreateTables() );
afterEach(() => jest.restoreAllMocks() );
afterAll(async () => await server.stop() );

describe('GetGroup', () => {
  it("should get the group from the db and return it", async () => {
    await server.createItem(f.mockDynamoCreateRequest);
    const result = await app.getGroup({pathParameters: {groupId: fakeId}});
    expect(JSON.parse(result.body)).toStrictEqual(f.mockGroup);
    expect(result.statusCode).toEqual(200);
  });

  it("should return 404 if the group doesn't exist", async () => {
    const result = await app.getGroup({pathParameters: {groupId: fakeId}});
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

  it("should create a default key for the group", async () => {
    await app.createGroup({body: JSON.stringify(f.mockCreateRequest)});
    const group = (await server.getAllItems('GROUPS_TABLE')).Items[0];
    expect(group).toHaveProperty('groupKeys');
    expect(Object.keys(group.groupKeys).length).toBe(1);
    const keyId = Object.keys(group.groupKeys)[0];
    expect(group.groupKeys[keyId].methods).toEqual(['*']);
    expect(group.groupKeys[keyId].name).toEqual('Default Key');
    expect(group.groupKeys[keyId]).toHaveProperty('token');
    const token = group.groupKeys[keyId].token
    const payload = jwt.verify(token, jwt_secret);
    expect(payload).toMatchObject({
      groupId: group.id,
      methods: ['*'],
      scope: 'group'
    })
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
});

describe('UpdateGroup', () => {
  it("should update the group in the database", async () => {
    await server.createItem(f.mockDynamoCreateRequest);
    const result = await app.updateGroup({pathParameters: {groupId: fakeId}, body: JSON.stringify(f.mockGroup2)});
    expect(result.statusCode).toEqual(204);
    const dbGroup = (await server.getAllItems('GROUPS_TABLE')).Items[0];
    expect(dbGroup).toStrictEqual(f.updatedDynamoGroup);
  });

  it("should return 404 if the group doesn't exist", async () => {
    const result = await app.updateGroup({pathParameters: {groupId: fakeId}, body: JSON.stringify(f.mockCreateRequest)});
    expect(result.statusCode).toEqual(404);
  });

  it("should return 500 if there is an error", async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await app.updateGroup({pathParameters: {}});
    expect(result.statusCode).toEqual(500);
    expect(log).toHaveBeenCalled();
  });
});

describe('ListGroupKeys', () => {
  it("should return the keys from the database", async () => {
    await server.createItem(f.mockDynamoCreateRequestWithKeys);
    const result = await app.listGroupKeys({pathParameters: {groupId: fakeId}});
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual(f.keysResult);
  });
});

describe('DeleteGroupKey', () => {
  it("should delete the keys from the group", async () => {
    await server.createItem(f.mockDynamoCreateRequestWithKeys);
    const result = await app.deleteGroupKey({pathParameters: {groupId: fakeId, keyId: 'abc'}});
    expect(result.statusCode).toEqual(204);
    const dbGroup = (await server.getAllItems('GROUPS_TABLE')).Items[0];
    expect(dbGroup.groupKeys).not.toHaveProperty('abc');
  });

  it("should return 404 if the group does not exist", async () => {
    await server.createItem(f.mockDynamoCreateRequestWithKeys);
    const result = await app.deleteGroupKey({pathParameters: {groupId: "BADID", keyId: 'abc'}});
    expect(result.statusCode).toEqual(404);
  });
});

describe('CreateMetrics', () => {
  it("add values to the history and update the group", async () => {
    await server.createItem(f.mockDynamoCreateRequest);
    const result = await app.createMetrics({pathParameters: {groupId: fakeId}, body: JSON.stringify(f.bulkMetrics)});
    expect(result.statusCode).toEqual(204);
    const dbGroup = (await server.getAllItems('GROUPS_TABLE')).Items[0];
    const dbValues = (await server.getAllItems('VALUES_TABLE')).Items;
    expect(dbGroup).toStrictEqual(f.updatedDynamoItem);
    expect(dbValues).toStrictEqual(f.dynamoValuesList);
  });

  it("should return 404 if the group doesn't exist", async () => {
    const result = await app.createMetrics({pathParameters: {groupId: fakeId}, body: JSON.stringify(f.bulkMetrics)});
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
    const result = await app.getMetric({pathParameters: {groupId: fakeId, metricId: fakeMetric}});
    expectedResult = dynamoValues.map(val => { return {time: val.metricTime, value: val.metricValues[fakeMetric]}}).reverse()
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toStrictEqual(expectedResult);
  });

  it("should return 404 if the group doesn't exist", async () => {
    const result = await app.getMetric({pathParameters: {groupId: fakeId, metricId: fakeMetric}});
    expect(result.statusCode).toEqual(404);
  });

  it("should return 500 if there is an error", async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await app.getMetric({pathParameters: {}});
    expect(result.statusCode).toEqual(500);
    expect(log).toHaveBeenCalled();
  });
});

describe('Login', () => {
  it("should return the token if the user can log in", async () => {
    const body = JSON.stringify({ user, pass })
    const result = await app.login({ body });
    expect(result.statusCode).toEqual(200);
    const json = JSON.parse(result.body);
    expect(json).toHaveProperty('token');
    const decoded = jwt.verify(json.token, jwt_secret);
    expect(decoded.scope).toEqual('user');
    expect(decoded.exp - decoded.iat).toBe(7 * 86400);
  });

  it("should return unauthorized if the username is wrong", async () => {
    const body = JSON.stringify({ user: 'baduser', pass })
    const result = await app.login({ body });
    expect(result.statusCode).toEqual(401);
  });

  it("should return unauthorized if the password is wrong", async () => {
    const body = JSON.stringify({ user, pass: 'badpass' })
    const result = await app.login({ body });
    expect(result.statusCode).toEqual(401);
  });
});
