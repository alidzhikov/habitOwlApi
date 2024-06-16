const Habit = require('../models/habit');
const Goal = require('../models/goal');
const { StreaksList } = require('../models/computed/streaksList');
const Speed = require('../models/speed');
const helpers = require('../common/helpers');
const mongoose = require('mongoose');
const entryQueries = require('../queries/entry');
const errorHelper = require('../validation/error');
const speedValidation = require('../validation/speed');
const speedStatus = require('../models/mappings/goalStatus');

//extract these to separate file 
var twoDaysAgoDate = new Date();
twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 7);
const entriesPopulateOptions = {
    path: 'entries', select: '_id speedId habitId performance date createdDate userId',
    match: {
        date: { $gte: twoDaysAgoDate }
    },
    options: { sort: '-date' }
};
const entriesPopulateOptionById = {
    path: 'entries', select: '_id speedId habitId performance date createdDate userId',
    options: { sort: '-date' }
};

const speedsPopulateOptions = {
    path: 'speeds',
    options: { sort: '-startDate' },
    populate: {
        path: 'goal'
    }
};

exports.getHabits = (req, res, next) => {
    console.log(req.userData.userId);
    console.log('___GET HABITS _____')
    Habit.find({ 'userId': req.userData.userId })
        .select('_id userId goals title comment imagePath category measure priority isNegative createdDate speeds entries streaks')
        .populate({
            path: 'speeds',
            populate: {
                path: 'goal'
            }
        })
        .populate({
            path: 'goals',
            model: 'Goal'
        })
        .populate(entriesPopulateOptions)
        .exec()
        .then(docs => {
            // var streaksList = new StreaksList();
            // var promises = [];
            // for (var habit of docs) {
            //     if (habit.entries.length) {
            //         var previousEntry = habit.entries[0];
            //         var intervalToCheck = 'daily';
            //         console.log(previousEntry.date);
            //         for (var entry of habit.entries.slice(1)) {
            //             console.log(entry.date)
            //             console.log(differenceBetweenDays(entry.date, previousEntry.date))
            //             const diff = differenceBetweenDays(entry.date, previousEntry.date);

            //             console.log('1 day difference');
            //             promises.push(streaksList.update(habit, entry.date, diff));
            //             previousEntry = entry;
            //         }
            //     }
            // }
            // return Promise.all(promises).then(r => {
            return {
                count: docs.length,
                habits: docs,
                //  streaksList: streaksList
            }
            // });
        })
        .then(response => {
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.getHabitById = (req, res, next) => {
    const id = req.params.habitId;
    Habit.findById(id)
        .populate(speedsPopulateOptions)
        .populate(entriesPopulateOptionById)
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: 'No habit found for provided ID.' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.createHabit = (req, res, next) => {
    const newHabitId = new mongoose.Types.ObjectId();
    var newSpeed;
    req.body.speeds.map(speed => {
        newSpeed = new Speed({
            _id: new mongoose.Types.ObjectId(),
            userId: speed.userId,
            habitId: newHabitId,
            goalId: null,
            createdDate: speed.createdDate,
            startDate: speed.startDate,
            endDate: speed.endDate,
            //priority: speed.priority,
            habitTimeFrame: speed.habitTimeFrame,
            repetitions: speed.repetitions,
            //status: speedStatus.active
        });
    });
    newSpeed.save()
        .then(rSpeed => {
            const habit = new Habit({
                _id: newHabitId,
                userId: req.body.userId,
                title: req.body.title,
                comment: req.body.comment,
                category: req.body.category,
                measure: req.body.measure,
                speeds: [newSpeed._id],
                entries: req.body.entries,
                createdDate: req.body.createdDate,
            });
            habit.save()
                .then(r => {
                    console.log(res);
                    res.status(200).json({
                        message: 'Handling POST requests to /habits ' + habit.id,
                        createdHabitId: habit._id
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.updateHabit = (req, res, next) => {
    const habitId = req.params.habitId;
    //errorHelper.validationCheck(req);
    const title = req.body.title;
    const comment = req.body.comment;
    const priority = req.body.priority;
    const imagePath = req.body.imagePath;
    const timeInDay = req.body.timeInDay;
    const category = req.body.category;
    const isNegative = req.body.isNegative;

    Habit.findById(habitId)
        .then(habit => {
            errorHelper.isItemFound(habit, 'habit');
            habit.title = title;
            habit.comment = comment;
            habit.priority = priority;
            habit.imagePath = imagePath;
            habit.timeInDay = timeInDay;
            habit.category = category;
            habit.isNegative = isNegative;
            return habit.save();
        })
        .then(habit => {
            let updatedSpeed;
            if (req.body.speeds.length == 0) {
                res.status(200).json({ message: 'Habit updated!', editedHabit: habit });
            }
            req.body.speeds.map(speedModified => {
                entryQueries.getEntriesBySpeedId(speedModified.id)
                    .then(entries => {
                        // later disable the fields if the speed has entries to it or maybe give a choice to remove all the entries if modification is required
                        const speedToSave = Speed.findById(speedModified.id)
                            .then(speed => {
                                let skipList = [];
                                if (entries.length > 0) {
                                    skipList.push('startDate');
                                    skipList.push('endDate');
                                }
                                helpers.objectAssignIfExists(speed, speedModified, skipList);

                                updatedSpeed = speed.save();
                                return updatedSpeed;
                            }).then(speedRes => {
                                console.log(speedRes);

                                res.status(200).json({ message: 'Habit updated!', editedHabit: speedRes });
                            });
                    });
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.addSpeedToHabit = (req, res, next) => {
    const habitId = req.params.habitId;
    //errorHelper.validationCheck(req);
    console.log('add speed to habit')
    Habit.findById(habitId)
        .populate('speeds')
        .exec()
        .then(habit => {
            errorHelper.isItemFound(habit, 'habit');
            let newSpeed = speedValidation.validateSpeedPeriod(habit, req.body.speeds);

            console.log(newSpeed);
            if (newSpeed) {
                let createdSpeed = new Speed({
                    _id: new mongoose.Types.ObjectId(),
                    userId: newSpeed.userId,
                    habitId: habit._id,
                    goal: newSpeed.goal,
                    title: newSpeed.title,
                    createdDate: newSpeed.createdDate,
                    startDate: newSpeed.startDate,
                    endDate: newSpeed.endDate,
                    //priority: newSpeed.priority,
                    habitTimeFrame: newSpeed.habitTimeFrame,
                    repetitions: newSpeed.repetitions,
                    //status: newSpeed.status
                });
                return createdSpeed.save()
                    .then(createdSpeed => {
                        habit.speeds.push(createdSpeed._id);
                        habit.save().then(updatedHabit => {
                            if (!newSpeed.goal) {
                                return res.status(200).json({ message: 'Speed updated!' });
                            }
                            Goal.findById(newSpeed.goal).then(goalRes => {
                                if (goalRes) {

                                    goalRes.speeds.push(createdSpeed.id);
                                    return goalRes.save();
                                } else {
                                    return res.status(200).json({ message: 'Speed updated!' });
                                }
                            }).then(savedG => res.status(200).json({ message: 'Speed updated!' }));
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                        next(err);
                    });
            } else {
                res.status(200).json({ message: 'Speed not created!' });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
            next(err);
        });
};


exports.editHabitSpeed = (req, res, next) => {
    const speedId = req.params.speedId;
    const goals = req.body.goals;
    const habitTimeframe = req.body.habitTimeframe;
    const repetitions = req.body.repetitions;
    const priority = req.body.priority;
    const status = req.body.status;
    const title = req.body.title;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const speedToEdit = Speed.findById(speedId);
    speedToEdit.then(speed => {
        console.log(JSON.stringify(speed));
        errorHelper.isItemFound(speed, 'speed');
        speed.goals = goals;
        speed.habitTimeframe = habitTimeframe;
        speed.repetitions = repetitions;
        speed.priority = priority;
        speed.status = status;
        speed.title = title;
        // check here if the dates are changed and update the associated entries
        speed.startDate = startDate;
        speed.endDate = endDate;
        return speed.save();
    })
        .then(result => {
            res.status(200).json({ message: 'Speed updated!', success: true, result: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteHabit = (req, res, next) => {
    console.log(req.params);

    // add a pre hook to delete the speeds and the habit id that is in the goal but why delete a habit in any case? mistakely typed maybe
    const id = req.params.habitId;
    let i = 1;
    let speedsToDelete = [];
    while (req.query['speedId' + i]) {
        speedsToDelete.push(req.query['speedId' + i]);
        i++;
    }
    Speed.deleteMany({ '_id': { $in: speedsToDelete } }).then(r => console.log('Speeds deleted ' + speedsToDelete)).catch(e => console.log(e));

    Habit.findOneAndRemove({ _id: id })
        .exec()
        .then(response => {
            res.status(200).json({ message: 'Succesfully deleted habit.' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};
