const dbGateway = require('../support/mockDynamoGateway');
const createGroupKey = jest.fn();
const createGroup = require('../../lib/use-cases/CreateGroup')({ dbGateway }, { createGroupKey });
const {
  mockCreateRequest,
  mockCreateRequestNoUnits,
  mockCreateRequestOnlyUnits,
  mockCreateRequestNoTime,
  mockCreateRequestOnlyName,
  mockHistory
} = require('../support/fixtures')
const fakeId = 'FAKEID';

describe('CreateGroup', () => {
  it("should pass through the data to the gateway", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId})
    await createGroup(mockCreateRequest);
    expect(dbGateway.createGroup).toHaveBeenCalledWith(mockCreateRequest);
  });

  it("should return the created group", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    const group = await createGroup(mockCreateRequest);
    expect(group.id).toEqual(fakeId);
  });

  it("should create a default key for the group", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    const group = await createGroup(mockCreateRequest);
    expect(createGroupKey).toHaveBeenCalledWith(group.id, "Default Key", ['*'])
  });

  it("should add timestamps if none are present", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    const mockDate = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    await createGroup(mockCreateRequestNoTime);
    expect(dbGateway.createGroup).toHaveBeenCalledWith({
      name: mockCreateRequestNoUnits.name,
      metrics: {
        "ac-current": {"time": mockDate.toISOString(), "value": 6.2}, 
        "ac-power": {"time": mockDate.toISOString(), "value": 83}
      }
    });
  });

  it("should not add timestamps if value is not present", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    await createGroup(mockCreateRequestOnlyUnits);
    expect(dbGateway.createGroup).toHaveBeenCalledWith(mockCreateRequestOnlyUnits);
  });

  it("should still work with no metrics", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    await createGroup(mockCreateRequestOnlyName);
    expect(dbGateway.createGroup).toHaveBeenCalledWith({
      name: mockCreateRequestOnlyName.name,
      metrics: {}
    });
  });

  it("should also store the metric values in the history", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    await createGroup(mockCreateRequest);
    expect(dbGateway.createValues).toHaveBeenCalledWith(fakeId, mockHistory);
  })

  it("should also store the metric values without timestamp in the history", async () => {
    dbGateway.createGroup.mockReturnValueOnce({id: fakeId});
    const mockDate = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    await createGroup(mockCreateRequestNoTime)
    expect(dbGateway.createValues).toHaveBeenCalledWith(fakeId, [
      {"time": mockDate.toISOString(), "value": 83},
      {"time": mockDate.toISOString(), "value": 6.2}
    ])
  })
});