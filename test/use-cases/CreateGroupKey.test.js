const dbGateway = require('../support/mockDynamoGateway');
const jwt_secret = 'abc123';
const createGroupKey = require('../../lib/use-cases/CreateGroupKey')({ dbGateway, loginData: { jwt_secret }});
const fakeId = 'FAKEID';
const jwt = require('jsonwebtoken');

describe('CreateGroupKey', () => {
  it("should pass through the data to the gateway and generate a correct key", async () => {
    const keyData = await createGroupKey(fakeId, "Test Key", ['GET', 'PUT']);
    expect(dbGateway.createGroupKey.mock.calls[0][0]).toEqual(fakeId);
    expect(dbGateway.createGroupKey.mock.calls[0][1]).toHaveProperty('id');
    expect(dbGateway.createGroupKey.mock.calls[0][1]).toHaveProperty('token');
    expect(dbGateway.createGroupKey.mock.calls[0][1].name).toEqual("Test Key");
    expect(dbGateway.createGroupKey.mock.calls[0][1].methods).toEqual(["GET", "PUT"]);
    const payload = jwt.verify(dbGateway.createGroupKey.mock.calls[0][1].token, jwt_secret);
    expect(payload).toMatchObject({
      groupId: fakeId,
      methods: ["GET", "PUT"],
      scope: 'group'
    })
  });

});