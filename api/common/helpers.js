const Speed = require('../models/speed');
const Habit = require('../models/habit');

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

exports.updateSpeedGoal = function(speedId, oldSpeedId, newGoalId, callback) {
    if (speedId == oldSpeedId) {
        return callback != null ? callback() : null;
    }
    // make it atomic later
    Speed.findById(speedId)
    .then(speed => {
        speed.goal = newGoalId;
        return speed.save();
    })
    .then(j => {
        if (oldSpeedId) {
            return Speed.findById(oldSpeedId)
            .then(oldSpeed => {
                oldSpeed.goal = null;
                return oldSpeed.save();
            });
        } else {
            return;
        }
    })
    .then(j => callback != null ? callback() : null)
    .catch(e => {});
  
}

exports.updateHabitGoals = async function(habits, oldHabits, newGoalId, callback) {
    var toRemove = [];
    var toAdd = [];
    if (oldHabits) {
        oldHabits = oldHabits.map((e) => e.valueOf());
        for (var oldHabitId of oldHabits) {
            if (habits.indexOf(oldHabitId) < 0) {
                toRemove.push(oldHabitId);
            }
        }
        for (var newHabitId of habits) {
            if (oldHabits.indexOf(newHabitId) < 0) {
                toAdd.push(newHabitId);
            }
        }
    } else {
        toAdd = habits;
    }

    var habitsDocToAdd = await Habit.find({ _id: toAdd});
    habitsDocToAdd.forEach(h => {
        h.goals.push(newGoalId);
    });

    var habitsDocToRemove = await Habit.find({ _id: toRemove});
    habitsDocToRemove.forEach(h => {
        var indexOfH = h.goals.indexOf(newGoalId);
        if (indexOfH > -1) {
            h.goals.splice(indexOfH, 1);
        }
    });

    return callback != null ? callback() : null;
}