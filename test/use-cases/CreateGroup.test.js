const dbGateway = { createGroup: jest.fn() };
const createGroup = require('../../lib/use-cases/CreateGroup')({ dbGateway });
const {
  mockCreateRequest,
  mockCreateRequestNoUnits,
  mockCreateRequestNoTime,
  mockCreateRequestOnlyName
} = require('../support/fixtures')

describe('CreateGroup', () => {
  it("should pass through the data to the gateway", () => {
    createGroup(mockCreateRequest)
    expect(dbGateway.createGroup).toHaveBeenCalledWith(mockCreateRequest)
  });

  it("should add timestamps if none are present", () => {
    const mockDate = new Date()
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    createGroup(mockCreateRequestNoTime)
    expect(dbGateway.createGroup).toHaveBeenCalledWith({
      name: mockCreateRequestNoUnits.name,
      metrics: {
        "ac-current": {"time": mockDate.toISOString(), "value": 6.2}, 
        "ac-power": {"time": mockDate.toISOString(), "value": 83}
      }
    });
  });

  it("should still work with no metrics", () => {
    createGroup(mockCreateRequestOnlyName)
    expect(dbGateway.createGroup).toHaveBeenCalledWith({
      name: mockCreateRequestOnlyName.name,
      metrics: {}
    });
  });
});