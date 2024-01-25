const Goal = require('../models/goal');
const Habit = require('../models/habit');
const Speed = require('../models/speed');
const Milestone = require('../models/milestone');
const mongoose = require('mongoose');
const errorHelper = require('../validation/error');
const helpers = require('../common/helpers');

exports.getGoals = (req, res, next) => {
    Goal.find({ 'userId': req.userData.userId, 'parentGoalId': null })
        .populate({ path: 'activeSpeed', model: 'Speed' })
        .populate({ 
            path: 'subGoals', 
            model: 'Goal',
        })
        .populate({
            path: 'habits',
            model: 'Habit', 
            populate: {
                path: 'speeds',
                model: 'Speed'
            },
            populate: {
                path: 'entries',
                model: 'Entry'
            }
        })
        .populate({ path: 'milestones', model: 'Milestone' })
        .exec()
        .then(docs => {
            res.status(200).json({ goals: docs });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.getTrackedGoals = (req, res, next) => {
    Goal.find({ 'userId': req.userData.userId })
        .populate({
            path: 'habits',
            model: 'Habit', 
            populate: [{
                path: 'speeds',
                model: 'Speed',
                select: '-goal'
            }, 
            {
                path: 'entries',
                model: 'Entry'
            }]
        })
        .exec()
        .then(docs => {
            res.status(200).json({ goals: docs });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.getGoalById = (req, res, next) => {
    const id = req.params.hoalId;
    Goal.findById(id)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: 'No hoal found for provided ID.' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.createGoalOrSubgoal = (req, res, next) => {
    const newGoalId = new mongoose.Types.ObjectId();
    const index = parseInt(req.params.index);
    const speedId = req.body.speeds[0];
    const subGoal = new Goal({
        _id: newGoalId,
        userId: req.body.userId,
        parentGoalId: req.body.parentGoalId,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        measure: req.body.measure,
        engine: req.body.engine,
        status: req.body.status,
        activeSpeed: req.body.activeSpeed,
        target: req.body.target,
        priority: req.body.priority,
        createdDate: req.body.createdDate,
        endDate: req.body.endDate,
        completionDate: req.body.completionDate,
        habits: req.body.habits,
        speeds: [speedId],
        milestones: [],
        subGoals: []
    });
    const activeSpeed = req.body.activeSpeed;
    const activeSpeedId = activeSpeed ? activeSpeed.id ? activeSpeed.id : new mongoose.Types.ObjectId() : null;
    if (activeSpeed && !activeSpeed.id) {

        let createdSpeed = new Speed({
            _id: activeSpeedId,
            userId: req.body.userId,
            habitId: req.body.habits[0],
            goal: subGoal.id,
            title: activeSpeed.title,
            createdDate: activeSpeed.createdDate,
            startDate: activeSpeed.startDate,
            endDate: activeSpeed.endDate,
            //priority: newSpeed.priority,
            habitTimeFrame: activeSpeed.habitTimeFrame,
            repetitions: activeSpeed.repetitions,
            //status: newSpeed.status
        });
        createdSpeed.save();
    } else {
        // update speeds goal to be the correct one
    }
    subGoal.activeSpeed = activeSpeedId;
    subGoal.save()
        .then(g => {
            // make it atomic later
            //helpers.updateSpeedGoal(speedId, null, newGoalId);
             
            // update parent goal
            if (!g.parentGoalId) {
                res.status(200).json({
                    message: 'Goal added to goal with id: ' + g.id,
                    goalId: g.id
                });
                return;
            }
            Goal.find({ 'userId': req.userData.userId, '_id': g.parentGoalId })
                .then((res) => {
                    let parentGoal = res[0];
                    if (parentGoal && parentGoal.id) {
                        if (index && index > -1) {
                            parentGoal.subGoals.splice(index + 1, 0, newGoalId);
                        } else {
                            parentGoal.subGoals.push(newGoalId);
                        }
                        return parentGoal.save();
                    }
                })
                .then(g => {
                    if (g && subGoal && subGoal.id) {
                        res.status(200).json({
                            message: 'Sub Goal added to goal with id: ' + g.id,
                            subGoalId: subGoal.id
                        });
                    } else {
                        res.status(500).json({ error: 'Error occured goal or sub Goal failed!' });
                    }
                });
           

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.updateGoal = (req, res, next) => {
    const goalId = req.params.goalId;
    //errorHelper.validationCheck(req);
    const title = req.body.title;
    const parentGoalId = req.body.parentGoalId;
    const description = req.body.description;
    const category = req.body.category;
    const measure = req.body.measure;
    const status = req.body.status;
    const activeSpeed = req.body.activeSpeed;
    const engine = req.body.engine;
    const target = req.body.target;
    const priority = req.body.priority;
    const completionDate = req.body.completionDate;
    const endDate = req.body.endDate;
    const habits = req.body.habits;
    const speedId = req.body.speeds[0];
    let oldSpeed;

    if (!activeSpeed.id) {

    }

    Goal.findById(goalId)
        .then(goal => {
            errorHelper.isItemFound(goal, 'goal');
            if (goal.parentGoalId != parentGoalId) {
                goal.parentGoalId = parentGoalId;
                Goal.findById(parentGoalId)
                .then(parentGoal => {
                    parentGoal.subGoals.push(goalId);
                })
                .catch(err => console.log(err));
                Goal.findById(goal.parentGoalId)
                .then(oldParentGoal => {

                })
                .catch(err => console.log(err));
            }
            goal.title = title;
            goal.description = description;
            goal.category = category;
            goal.measure = measure;
            goal.status = status;
            goal.activeSpeed = activeSpeed && activeSpeed.id ? activeSpeed : null;
            goal.engine = engine;
            goal.target = target;
            goal.priority = priority;
            goal.endDate = endDate;
            goal.completionDate = completionDate;
            goal.habits = habits;
            if (goal.speeds[0] !== speedId) {
                oldSpeed = goal.speeds[0];
            }
            
            goal.speeds = [speedId];

            goal.save()
                .then(g => {
                    // make it atomic later
                    helpers.updateSpeedGoal(
                        speedId,
                        oldSpeed,
                        goalId,
                        () => res.status(200).json({ message: 'Goal updated!', success: true, result: g })
                    );
                })
                .catch(err => {
                    console.log(err);
                    err.statusCode = 500;
                    next();
                });
        }).catch(err => {
            err.statusCode = 500;
            next();
        });
};

exports.createMilestone = (req, res, next) => {
    const newMilestoneId = new mongoose.Types.ObjectId();
    const index = parseInt(req.params.index);
    const milestone = new Milestone({
        _id: newMilestoneId,
        userId: req.body.userId,
        goalId: req.body.goalId,
        title: req.body.title,
        description: req.body.description,
        target: req.body.target,
        createdDate: req.body.createdDate,
        endDate: req.body.endDate,
        completionDate: req.body.completionDate
    });
    milestone.save()
        .then(m => {
            Goal.find({ 'userId': req.userData.userId, '_id': m.goalId })//do it wuth findbyid instead after checking user id thing
                .then((res) => {
                    let parentGoal = res[0];
                    if (parentGoal && parentGoal.id) {
                        if (index && index > -1) {
                            parentGoal.milestones.splice(index + 1, 0, m._id);
                        } else {
                            parentGoal.milestones.push(m._id);
                        }
                        return parentGoal.save();
                    }
                }).then(g => {
                    if (g && newMilestoneId) {
                        res.status(200).json({
                            message: 'Milestone added to goal with id: ' + g.id,
                            milestoneId: newMilestoneId
                        });
                    } else {
                        res.status(500).json({ error: 'Error occured goal or milestone failed' });
                    }
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.editMilestone = (req, res, next) => {
    const milestoneId = req.params.milestoneId;
    //errorHelper.validationCheck(req);
    const title = req.body.title;
    const description = req.body.description;
    const target = req.body.target;
    const endDate = req.body.endDate;
    const completionDate = req.body.completionDate;

    Milestone.findById(milestoneId)
        .then(milestone => {
            errorHelper.isItemFound(milestone, 'milestone');
            milestone.title = title;
            milestone.description = description;
            milestone.target = target;
            milestone.endDate = endDate;
            milestone.completionDate = completionDate;

            milestone.save()
                .then(m => res.status(200).json({ message: 'Milestone updated!', success: true, result: m }))
                .catch(err => {
                    err.statusCode = 500;
                    next();
                });
        }).catch(err => {
            err.statusCode = 500;
            next();
        });
};

exports.removeMilestone = (req, res, next) => {
    const milestoneId = req.params.milestoneId;
    const goalId = req.params.goalId;
    console.log('Deleting milestone ' + milestoneId + 'goal ' + goalId);
    if (goalId && milestoneId) {
        Goal.findById(goalId).then(g => {
            const indexOfInterest = g.milestones.indexOf(milestoneId);
            if (indexOfInterest > -1) {
                g.milestones.splice(indexOfInterest, 1);
                g.save()
                    .then(savedG => {
                        res.status(200).json({
                            message: 'Habit with ID ' + milestoneId + ' was deleted from goal with id: ' + goalId,
                        })
                    }).catch(err => {
                        res.status(500).json({ error: err });
                    });
            } else {
                res.status(500).json({ error: 'No habit with this id was found broski' });
            }
        }).catch(err => {
            res.status(500).json({ error: err });
        });
    }
};

exports.addHabitToGoal = (req, res, next) => {
    const goalId = req.params.goalId;
    let habitId = req.body.id;
    if (!habitId) {
        habitId = new mongoose.Types.ObjectId();
        const newHabit = new Habit({
            _id: habitId
        });
        //etc
    } else {
        Goal.findById(goalId).then(g => {
            g.habits.push(habitId);
            g.save()
                .then(savedG => {
                    res.status(200).json({
                        message: 'Habit added to goal with id: ' + g.id,
                    })
                }).catch(err => {
                    res.status(500).json({ error: err });
                });
        }).catch(err => {
            res.status(500).json({ error: err });
        });
    }
};

exports.removeHabitFromGoal = (req, res, next) => {
    const goalId = req.params.goalId;
    const habitId = req.params.habitId;
    console.log('Deleting habit ' + habitId + 'goal ' + goalId);
    if (goalId && habitId) {
        Goal.findById(goalId).then(g => {
            const indexOfInterest = g.habits.indexOf(habitId);
            if (indexOfInterest > -1) {
                g.habits.splice(indexOfInterest, 1);
                g.save()
                    .then(savedG => {
                        res.status(200).json({
                            message: 'Habit with ID ' + habitId + ' was deleted from goal with id: ' + goalId,
                        })
                    }).catch(err => {
                        res.status(500).json({ error: err });
                    });
            } else {
                res.status(500).json({ error: 'No habit with this id was found broski' });
            }
        }).catch(err => {
            res.status(500).json({ error: err });
        });
    }
};

exports.addSpeedToGoal = (req, res, next) => {
    const goalId = req.params.goalId;
    let speedId = req.body.id;
    if (!speedId) {
        speedId = new mongoose.Types.ObjectId();
        const newSpeed = new Speed({
            _id: speedId
        });
        //etc
        next();
    } else {
        Goal.findById(goalId).then(g => {
            g.speeds.push( g.activeSpeed);
            g.activeSpeed = speedId;
            g.save()
                .then(savedG => {
                    Speed.findById(speedId)
                        .then(s => {
                            s.goalId = goalId;
                            return s.save();
                        }).then(savedS => {
                            res.status(200).json({
                                message: 'Speed added to goal with id: ' + g.id,
                            });
                        }).catch(err => {
                            res.status(500).json({ error: err });
                        });
                }).catch(err => {
                    res.status(500).json({ error: err });
                });
        }).catch(err => {
            res.status(500).json({ error: err });
        });
    }
};

exports.deleteGoal = (req, res, next) => {
    const id = req.params.goalId;
    console.log('Deleting goal ' + id);
    Goal.deleteOne({ _id: id })
        .exec()
        .then(response => {
            res.status(200).json({ message: 'Succesfully deleted goal.' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};