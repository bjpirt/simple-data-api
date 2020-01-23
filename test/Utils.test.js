const utils = require('../lib/Utils');
const {
  mockGroup,
  mockDynamoCreateRequest,
  mockDynamoUnmatchedItem,
  mockUnmatchedGroup,
  mockDynamoNoMetricsItem,
  mockGroupNoMetrics,
  mockDynamoEmptyItem,
  mockemptyGroup
} = require('./support/fixtures')

describe('Utils', () => {
  describe('formatDynamoGroup', () => {
    it("should merge units and values", async () => {
      const result = utils.formatDynamoGroup(mockDynamoCreateRequest.Item)
      expect(result).toEqual(mockGroup)
    });

    it("should work correctly if units and metrics don't match", async () => {
      const result = utils.formatDynamoGroup(mockDynamoUnmatchedItem)
      expect(result).toEqual(mockUnmatchedGroup)
    });

    it("should work correctly if there are no units and metrics", async () => {
      const result = utils.formatDynamoGroup(mockDynamoNoMetricsItem)
      expect(result).toEqual(mockGroupNoMetrics)
    });

    it("should work correctly if there is no name", async () => {
      const result = utils.formatDynamoGroup(mockDynamoEmptyItem)
      expect(result).toEqual(mockemptyGroup)
      expect(Object.keys(result).sort()).toEqual(['id', 'metrics'])
    });
  });
});