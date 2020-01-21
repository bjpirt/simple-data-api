const dbGateway = { createGroup: jest.fn() };
const createGroup = require('../../lib/use-cases/CreateGroup')({ dbGateway });
const {
  mockCreateRequest,
  mockCreateRequestNoUnits,
  mockCreateRequestNoTime,
  mockCreateRequestOnlyUnits,
  mockCreateRequestOnlyName
} = require('../fixtures')

describe('CreateGroup', () => {
  it("should separate the metrics from the units", () => {
    createGroup(mockCreateRequest)
    expect(dbGateway.createGroup).toHaveBeenCalledWith(
      mockCreateRequest.name,
      {
        "ac-current": {"time": "2020-01-16T08:21:57Z", "value": 6.2}, 
        "ac-power": {"time": "2020-01-16T08:21:57Z", "value": 83}
      },
      {"ac-current": "A", "ac-power": "W"}
    )
  });

  it("should work if no units are present", () => {
    createGroup(mockCreateRequestNoUnits)
    expect(dbGateway.createGroup).toHaveBeenCalledWith(
      mockCreateRequestNoUnits.name,
      {
        "ac-current": {"time": "2020-01-16T08:21:57Z", "value": 6.2}, 
        "ac-power": {"time": "2020-01-16T08:21:57Z", "value": 83}
      },
      {}
    )
  });

  it("should add timestamps if none are present", () => {
    const mockDate = new Date()
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    createGroup(mockCreateRequestNoTime)
    expect(dbGateway.createGroup).toHaveBeenCalledWith(
      mockCreateRequestNoUnits.name,
      {
        "ac-current": {"time": mockDate.toISOString(), "value": 6.2}, 
        "ac-power": {"time": mockDate.toISOString(), "value": 83}
      },
      {}
    )
  });

  it("should only add units if no time and value are present", () => {
    createGroup(mockCreateRequestOnlyUnits)
    expect(dbGateway.createGroup).toHaveBeenCalledWith(
      mockCreateRequestOnlyUnits.name,
      {
        "ac-current": {}, 
        "ac-power": {}
      },
      {"ac-current": "A", "ac-power": "W"}
    )
  });

  it("should create a group with no metrics", () => {
    createGroup(mockCreateRequestOnlyName)
    expect(dbGateway.createGroup).toHaveBeenCalledWith(
      mockCreateRequestOnlyName.name,
      {},
      {}
    )
  });
});