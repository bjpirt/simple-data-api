const dbGateway = require('../support/mockDynamoGateway');
const getMetric = require('../../lib/use-cases/GetMetric')({ dbGateway });
const f = require('../support/fixtures')
const fakeId = "FAKEID";
const fakeMetric = 'ac-power';

afterEach(() => jest.restoreAllMocks() );

describe('GetMetric', () => {
  it("should set default start and end parameters and return the results", async () => {
    jest.spyOn(dbGateway, 'getGroup').mockImplementation(() => { return {id: "FAKEID"}});
    const date = Date;
    const mockEnd = new date();
    const mockConstructor = jest.fn();
    dbGateway.getGroup = jest.fn(() => true);
    mockConstructor.mockReturnValueOnce(mockEnd)
      .mockImplementation(d => new date(d));
    const mockDate = jest.spyOn(global, 'Date')
    mockDate.mockImplementation(mockConstructor);

    await getMetric(fakeId, fakeMetric, {});
    const options = {
      end: mockEnd,
      start: new Date(mockEnd - 3600000)
    }
    expect(dbGateway.getMetric).toHaveBeenCalledWith(fakeId, fakeMetric, options);
    mockDate.mockRestore()
  });

  it("should set the end parameter if only start is specified", async () => {
    jest.spyOn(dbGateway, 'getGroup').mockImplementation(() => { return {id: "FAKEID"}});
    const start = new Date();
    await getMetric(fakeId, fakeMetric, {start});
    const expectedOptions = {
      end: new Date(start + 3600000),
      start
    }
    expect(dbGateway.getMetric).toHaveBeenCalledWith(fakeId, fakeMetric, expectedOptions);
  });

  it("should set the end parameter if only end is specified", async () => {
    jest.spyOn(dbGateway, 'getGroup').mockImplementation(() => { return {id: "FAKEID"}});
    const end = new Date();
    await getMetric(fakeId, fakeMetric, {end});
    const expectedOptions = {
      end,
      start: new Date(end - 3600000)
    }
    expect(dbGateway.getMetric).toHaveBeenCalledWith(fakeId, fakeMetric, expectedOptions);
  });

  it("should return raw values if no interval is specified", async () => {
    jest.spyOn(dbGateway, 'getGroup').mockImplementation(() => { return {id: "FAKEID"}});
    dbGateway.getMetric.mockReturnValue(f.mockValues);
    const result = await getMetric(fakeId, fakeMetric, {});
    expect(result).toEqual(f.mockValues);
  });

  it("should average values grouped by interval if specified", async () => {
    jest.spyOn(dbGateway, 'getGroup').mockImplementation(() => { return {id: "FAKEID"}});
    dbGateway.getMetric.mockReturnValue(f.mockValues);
    const result = await getMetric(fakeId, fakeMetric, {interval: 60});
    expect(result).toEqual(f.mockGroupedValues);
  });

  it("should accept null for options", async () => {
    jest.spyOn(dbGateway, 'getGroup').mockImplementation(() => { return {id: "FAKEID"}});
    dbGateway.getMetric.mockReturnValue(f.mockValues);
    const result = await getMetric(fakeId, fakeMetric, null);
    expect(result).toEqual(f.mockValues);
  });
});