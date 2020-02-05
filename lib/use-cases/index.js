function initUseCases(options) {
  const UseCases = {}
  UseCases.createGroup = require('./CreateGroup')(options, UseCases);
  UseCases.listGroups = require('./ListGroups')(options), UseCases;
  UseCases.getGroup = require('./GetGroup')(options, UseCases);
  UseCases.updateGroup = require('./UpdateGroup')(options, UseCases);
  UseCases.createGroupKey = require('./CreateGroupKey')(options, UseCases);
  UseCases.deleteGroupKey = require('./DeleteGroupKey')(options, UseCases);
  UseCases.listGroupKeys = require('./ListGroupKeys')(options, UseCases);
  UseCases.createBulkReadings = require('./CreateBulkMetrics')(options, UseCases);
  UseCases.getMetric = require('./GetMetric')(options, UseCases);
  UseCases.login = require('./Login')(options, UseCases);
  return UseCases;
}

module.exports = initUseCases;
