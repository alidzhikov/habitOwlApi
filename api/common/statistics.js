
exports.calculateStreaks = async function(habits, oldHabits, newGoalId, callback) {
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