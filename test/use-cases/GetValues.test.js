const dbGateway = require('../support/mockDynamoGateway');
const getValues = require('../../lib/use-cases/GetValues')({ dbGateway });
const f = require('../support/fixtures')
const fakeId = "FAKEID";
const fakeMetric = 'ac-power';

describe('GetValues', () => {
  it("should set default start and end parameters and return the results", async () => {
    const date = Date;
    const mockEnd = new date();
    const mockConstructor = jest.fn();
    mockConstructor.mockReturnValueOnce(mockEnd)
      .mockImplementation(d => new date(d));
    const mockDate = jest.spyOn(global, 'Date')
    mockDate.mockImplementation(mockConstructor);

    await getValues(fakeId, fakeMetric, {});
    const options = {
      end: mockEnd,
      start: new Date(mockEnd - 3600000)
    }
    expect(dbGateway.getValues).toHaveBeenCalledWith(fakeId, fakeMetric, options);
    mockDate.mockRestore()
  });

  it("should set the end parameter if only start is specified", async () => {
    const start = new Date();
    await getValues(fakeId, fakeMetric, {start});
    const expectedOptions = {
      end: new Date(start + 3600000),
      start
    }
    expect(dbGateway.getValues).toHaveBeenCalledWith(fakeId, fakeMetric, expectedOptions);
  });

  it("should set the end parameter if only end is specified", async () => {
    const end = new Date();
    await getValues(fakeId, fakeMetric, {end});
    const expectedOptions = {
      end,
      start: new Date(end - 3600000)
    }
    expect(dbGateway.getValues).toHaveBeenCalledWith(fakeId, fakeMetric, expectedOptions);
  });

  it("should return raw values if no interval is specified", async () => {
    dbGateway.getValues.mockReturnValue(f.mockValues);
    const result = await getValues(fakeId, fakeMetric, {});
    expect(result).toEqual(f.mockValues);
  });

  it("should average values grouped by interval if specified", async () => {
    dbGateway.getValues.mockReturnValue(f.mockValues);
    const result = await getValues(fakeId, fakeMetric, {interval: 60});
    expect(result).toEqual(f.mockGroupedValues);
  });

  it("should accept null for options", async () => {
    dbGateway.getValues.mockReturnValue(f.mockValues);
    const result = await getValues(fakeId, fakeMetric, null);
    expect(result).toEqual(f.mockValues);
  });
});