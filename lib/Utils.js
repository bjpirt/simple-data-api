module.exports = {
  formatDynamoGroup: function (groupResult) {
    const group = {id: groupResult.id, metrics: groupResult.metricValues}
    if(groupResult.groupName) group.name = groupResult.groupName;
    
    for(let metric in group.metrics){
      if(groupResult.metricUnits[metric]) group.metrics[metric].unit = groupResult.metricUnits[metric];
    }
    for(let metric in groupResult.metricUnits){
      if(!group.metrics[metric]) group.metrics[metric] = {unit: groupResult.metricUnits[metric]};
    }
    return group;
  },
  generateRandomId: (length) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
}
