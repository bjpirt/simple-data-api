const dbGateway = require('../support/mockDynamoGateway');
const createGroup = require('../../lib/use-cases/CreateGroup')({ dbGateway });
const {
  mockCreateRequest,
  mockCreateRequestNoUnits,
  mockCreateRequestOnlyUnits,
  mockCreateRequestNoTime,
  mockCreateRequestOnlyName,
  mockHistory
} = require('../support/fixtures')

describe('CreateGroup', () => {
  it("should pass through the data to the gateway", async () => {
    await createGroup(mockCreateRequest);
    expect(dbGateway.createGroup).toHaveBeenCalledWith(mockCreateRequest);
  });

  it("should return the created group", async () => {
    dbGateway.createGroup.mockReturnValue({id: "FAKEID"});
    const group = await createGroup(mockCreateRequest);
    expect(group.id).toEqual('FAKEID');
  });

  it("should add timestamps if none are present", async () => {
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
    await createGroup(mockCreateRequestOnlyUnits);
    expect(dbGateway.createGroup).toHaveBeenCalledWith(mockCreateRequestOnlyUnits);
  });

  it("should still work with no metrics", async () => {
    await createGroup(mockCreateRequestOnlyName);
    expect(dbGateway.createGroup).toHaveBeenCalledWith({
      name: mockCreateRequestOnlyName.name,
      metrics: {}
    });
  });

  it("should also store the metric values in the history", async () => {
    await createGroup(mockCreateRequest);
    expect(dbGateway.createValues).toHaveBeenCalledWith(mockHistory);
  })

  it("should also store the metric values without timestamp in the history", async () => {
    const mockDate = new Date();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    await createGroup(mockCreateRequestNoTime)
    expect(dbGateway.createValues).toHaveBeenCalledWith([
      {"time": mockDate.toISOString(), "value": 83},
      {"time": mockDate.toISOString(), "value": 6.2}
    ])
  })
});