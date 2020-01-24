const dbGateway = require('../support/mockDynamoGateway');
const listGroups = require('../../lib/use-cases/ListGroups')({ dbGateway });

describe('ListGroups', () => {
  it("should pass through the data to the gateway", async () => {
    const dummyGroups = [
      {name: "one"},
      {name: "two"}
    ]
    dbGateway.listGroups.mockReturnValue(dummyGroups);
    const response = await listGroups();
    expect(dbGateway.listGroups).toHaveBeenCalled();
    expect(response).toBe(dummyGroups);
  });
});