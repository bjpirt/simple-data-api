const dbGateway = require('../support/mockDynamoGateway');
const listGroupKeys = require('../../lib/use-cases/ListGroupKeys')({ dbGateway });
const f = require('../support/fixtures')
const fakeId = 'FAKEID';

describe('ListGroups', () => {
  it("should pass through the data to the gateway and return the result", async () => {
    const keysResult = [{name: "Default Key"}];
    dbGateway.listGroupKeys.mockReturnValue(keysResult);
    const response = await listGroupKeys(fakeId);
    expect(dbGateway.listGroupKeys).toHaveBeenCalledWith(fakeId);
    expect(response).toBe(keysResult);
  });
});