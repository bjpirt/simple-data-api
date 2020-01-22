
const config = require('../support/mockDynamoDbConnection')
const dynamo = require('../../lib/gateways/Dynamo')(config);
const {
  mockCreateRequest,
  mockCreateRequestNoUnits,
  mockCreateRequestOnlyUnits,
  mockDynamoCreateRequest,
  mockDynamoCreateRequestNoUnits,
  mockDynamoCreateRequestOnlyUnits
} = require('../support/fixtures')

describe('Dynamo Gateway', () => {

  describe('createGroup', () => {
    beforeEach(() => {
      dynamo.generateGroupId = jest.fn();
      dynamo.generateGroupId.mockReturnValue("FAKEID");
    });

    it("should pass through the data to the connection", async () => {
      await dynamo.createGroup(mockCreateRequest);
      expect(config.client.aput).toHaveBeenCalledWith(mockDynamoCreateRequest);
    });

    it("should work if no units are present", async () => {
      await dynamo.createGroup(mockCreateRequestNoUnits);
      expect(config.client.aput).toHaveBeenCalledWith(mockDynamoCreateRequestNoUnits);
    });

    it("should still add units if no time and value are present", async () => {
      await dynamo.createGroup(mockCreateRequestOnlyUnits);
      expect(config.client.aput).toHaveBeenCalledWith(mockDynamoCreateRequestOnlyUnits);
    });
  });
});
