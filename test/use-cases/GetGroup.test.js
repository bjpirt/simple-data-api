const dbGateway = require('../support/mockDynamoGateway');
const getGroup = require('../../lib/use-cases/GetGroup')({ dbGateway });
const fakeId = "FAKEID";

describe('GetGroup', () => {
  it("should get the group from the gateway and return it", async () => {
    const fakeGroup = {id: fakeId}
    dbGateway.getGroup.mockReturnValue(fakeGroup);
    const group = await getGroup(fakeId);
    expect(dbGateway.getGroup).toHaveBeenCalledWith(fakeId);
    expect(group).toEqual(fakeGroup);
  });
});