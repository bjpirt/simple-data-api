function initUseCases(options) {
  return {
    createGroup: require('./CreateGroup')(options),
    listGroups: require('./ListGroups')(options),
    getGroup: require('./GetGroup')(options),
    getGroupReadings: require('./GetGroupMetrics')(options),
    createBulkReadings: require('./CreateBulkMetrics')(options),
    getValues: require('./GetValues')(options)
  };
}

module.exports = initUseCases;
