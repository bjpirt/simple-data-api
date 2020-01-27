const dbGateway = require('../support/mockDynamoGateway');
const listGroups = require('../../lib/use-cases/ListGroups')({ dbGateway });
const f = require('../support/fixtures')

describe('ListGroups', () => {
  it("should pass through the data to the gateway", async () => {
    dbGateway.listGroups.mockReturnValue(f.groupList);
    const response = await listGroups();
    expect(dbGateway.listGroups).toHaveBeenCalled();
    expect(response).toBe(f.groupList);
  });
});