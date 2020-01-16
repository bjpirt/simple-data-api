module.exports = {
  formatGroup: function (groupResult) {
    const group = {id: groupResult.id, name: groupResult.groupName, metrics: groupResult.metricValues}
    for(let key in group.metrics){
      if(groupResult.metricUnits[key]) group.metrics[key].unit = groupResult.metricUnits[key];
    }
    return group;
  }
}
