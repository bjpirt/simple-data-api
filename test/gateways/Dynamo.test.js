
const config = require('../support/mockDynamoDbConnection')
const dynamo = require('../../lib/gateways/Dynamo')(config);
const f = require('../support/fixtures')

describe('Dynamo Gateway', () => {

  describe('createGroup', () => {
    beforeEach(() => {
      dynamo.generateGroupId = jest.fn();
      dynamo.generateGroupId.mockReturnValue("FAKEID");
    });

    it("should pass through the data to the connection", async () => {
      await dynamo.createGroup(f.mockCreateRequest);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequest);
    });

    it("should work if no units are present", async () => {
      await dynamo.createGroup(f.mockCreateRequestNoUnits);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequestNoUnits);
    });

    it("should still add units if no time and value are present", async () => {
      await dynamo.createGroup(f.mockCreateRequestOnlyUnits);
      expect(config.client.aput).toHaveBeenCalledWith(f.mockDynamoCreateRequestOnlyUnits);
    });
  });

  describe('updateGroup', () => {
    it("should pass through the correct data to the connection", async () => {
      await dynamo.updateGroup('FAKEID', f.mockGroup);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroup);
    });

    it("should pass through the correct data to the connection if no units", async () => {
      await dynamo.updateGroup('FAKEID', f.mockCreateRequestNoUnits);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroupNoUnits);
    });

    it("should pass through the correct data to the connection if only units", async () => {
      await dynamo.updateGroup('FAKEID', f.mockCreateRequestOnlyUnits);
      expect(config.client.aupdate).toHaveBeenCalledWith(f.mockDynamoUpdateGroupOnlyUnits);
    });

    it("should raise an error if the group was not found", async () => {
      let exception = null;
      config.client.aupdate = jest.fn(() => {
        throw(f.updateException);
      });
      try{
        await dynamo.updateGroup('BADID', f.mockCreateRequestOnlyUnits);
        expect(true).toBe(false);
      }catch(e){
        exception = e;
      }
      expect(exception).toBe('NotFoundException')
    });

  });
});
