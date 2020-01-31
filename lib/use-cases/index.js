function initUseCases(options) {
  const UseCases = {}
  UseCases.createGroup = require('./CreateGroup')(options, UseCases);
  UseCases.listGroups = require('./ListGroups')(options), UseCases;
  UseCases.getGroup = require('./GetGroup')(options, UseCases);
  UseCases.updateGroup = require('./UpdateGroup')(options, UseCases);
  UseCases.createBulkReadings = require('./CreateBulkMetrics')(options, UseCases);
  UseCases.getMetric = require('./GetMetric')(options, UseCases);
  return UseCases;
}

module.exports = initUseCases;
