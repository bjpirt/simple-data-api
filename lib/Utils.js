module.exports = {
  formatGroup: function (groupResult) {
    const group = {id: groupResult.id, name: groupResult.name, metrics: groupResult.metrics}
    for(let key in group.metrics){
      if(groupResult.units[key]) group.metrics[key].unit = groupResult.units[key];
    }
    return group;
  }
}
