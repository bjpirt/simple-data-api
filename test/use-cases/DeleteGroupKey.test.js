const dbGateway = require('../support/mockDynamoGateway');
const deleteGroupKey = require('../../lib/use-cases/DeleteGroupKey')({ dbGateway });
const fakeId = "FAKEID";
const fakeKeyId = "FAKEKEYID";


describe('CreateGroupKey', () => {
  it("should pass through the parameters to the gateway", async () => {
    await deleteGroupKey(fakeId, fakeKeyId);
    expect(dbGateway.deleteGroupKey).toHaveBeenCalledWith(fakeId, fakeKeyId);
  });
});