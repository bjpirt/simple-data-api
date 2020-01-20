function initUseCases(options) {
  const UseCases = {}
  UseCases.createGroup = require('./CreateGroup')(options, UseCases);
  UseCases.listGroups = require('./ListGroups')(options), UseCases;
  UseCases.getGroup = require('./GetGroup')(options, UseCases);
  UseCases.updateGroup = require('./UpdateGroup')(options, UseCases);
  UseCases.getGroupReadings = require('./GetGroupMetrics')(options, UseCases);
  UseCases.createBulkReadings = require('./CreateBulkMetrics')(options, UseCases);
  UseCases.getValues = require('./GetValues')(options, UseCases);
  UseCases.createValues = require('./CreateValues')(options, UseCases);
  return UseCases;
}

module.exports = initUseCases;
