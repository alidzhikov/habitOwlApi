const Speed = require('../models/speed');

exports.objectAssignIfExists = function (old, modified, skipList) {
    for (const key in modified) {
        if (skipList.indexOf(key) > -1) continue;
        if (old && key in old) {
            const newValue = modified[key];
            // console.log(key + ' -> ' + newValue)
            if (newValue) {
                old[key] = newValue;
            }
        }
    }
}

exports.updateSpeedGoal = function(speedId, newGoalId, callback) {
    // make it atomic later
    Speed.findById(speedId)
    .then(speed => {
        speed.goal = newGoalId;
        return speed.save();
    })
    .then(j => callback != null ? callback() : null)
    .catch(e => {});
  
}