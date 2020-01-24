const dbGateway = require('../support/mockDynamoGateway');
const mockUseCases = { getGroup: jest.fn(), updateGroup: jest.fn()};
const createBulkMetrics = require('../../lib/use-cases/CreateBulkMetrics')({ dbGateway }, mockUseCases);
const f = require('../support/fixtures')
const fakeId = "FAKEID";

describe('GetGroup', () => {
  it("should send the values to the gateway", async () => {
    mockUseCases.getGroup.mockReturnValue(f.mockGroup);
    await createBulkMetrics(fakeId, f.bulkMetrics);
    expect(dbGateway.createValues).toHaveBeenCalledWith(fakeId, f.individualMetrics);
  });

  it("should update the group if the values are newer", async () => {
    mockUseCases.getGroup.mockReturnValue(f.mockGroup);
    await createBulkMetrics(fakeId, f.bulkMetrics);
    expect(mockUseCases.updateGroup).toHaveBeenCalledWith(fakeId, f.bulkGroupUpdate);
  });

  it("should update the group if a value is new", async () => {
    mockUseCases.getGroup.mockReturnValue(f.mockGroup);
    await createBulkMetrics(fakeId, f.bulkMetricsNewMetric);
    expect(dbGateway.createValues).toHaveBeenCalledWith(fakeId, f.individualMetricsNewMetric);
    expect(mockUseCases.updateGroup).toHaveBeenCalledWith(fakeId, f.bulkGroupUpdateNewMetric);
  });

  it("should not update the group if the values are older", async () => {
    mockUseCases.getGroup.mockReturnValue(f.mockGroup);
    await createBulkMetrics(fakeId, f.bulkMetricsOldTime);
    expect(dbGateway.createValues).toHaveBeenCalledWith(fakeId, f.individualMetricsOldTime);
    expect(mockUseCases.updateGroup).not.toHaveBeenCalled();
  });

  it("should only update the group values that are newer", async () => {
    mockUseCases.getGroup.mockReturnValue(f.mockGroup);
    await createBulkMetrics(fakeId, f.bulkMetricsPartialNew);
    expect(mockUseCases.updateGroup).toHaveBeenCalledWith(fakeId, f.bulkGroupUpdatePartialNew);
  });
});