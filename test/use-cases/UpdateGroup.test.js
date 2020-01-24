const dbGateway = require('../support/mockDynamoGateway');
const updateGroup = require('../../lib/use-cases/UpdateGroup')({ dbGateway });
const {
  mockGroup,
  mockCreateRequestNoTime,
  mockGroupPlusTimes,
  mockGroupMetricsMissing,
  mockCreateRequestOnlyUnits
} = require('../support/fixtures')
const fakeId = "FAKEID";

describe('UpdateGroup', () => {
  it("should pass the group through to the gateway", async () => {
    await updateGroup(fakeId, mockGroup);
    expect(dbGateway.updateGroup).toHaveBeenCalledWith(fakeId, mockGroup);
  });

  it("should pass the group through to the gateway if no metrics", async () => {
    await updateGroup(fakeId, mockGroupMetricsMissing);
    expect(dbGateway.updateGroup).toHaveBeenCalledWith(fakeId, mockGroupMetricsMissing);
  });

  it("should add the time to the metrics if missing", async () => {
    const mockDate = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    await updateGroup(fakeId, mockCreateRequestNoTime);
    expect(dbGateway.updateGroup).toHaveBeenCalledWith(fakeId, mockGroupPlusTimes(mockDate));
  });

  it("should not add the time to the metrics if no value", async () => {
    await updateGroup(fakeId, mockCreateRequestOnlyUnits);
    expect(dbGateway.updateGroup).toHaveBeenCalledWith(fakeId, mockCreateRequestOnlyUnits);
  });
});