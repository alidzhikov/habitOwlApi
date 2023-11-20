const Goal = require('../models/goal');
const Habit = require('../models/habit');
const Milestone = require('../models/milestone');
const mongoose = require('mongoose');
const errorHelper = require('../validation/error');

exports.getGoals = (req, res, next) => {
    Goal.find({'userId': req.userData.userId, 'parentId': null })
    .exec()
    .then(docs => {
        res.status(200).json({goals: docs});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
};

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
    const subGoal = new Goal({
        _id: newGoalId,
        userId: req.body.userId,
        parentGoalId: req.body.parentGoalId,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        measure: req.body.measure,
        target: req.body.target,
        priority: req.body.priority,
        createdDate: req.body.createdDate,
        endDate: req.body.endDate,
        completionDate: req.body.completionDate,
        habits: [],
        milestones: [],
        subGoals: []
    });
    subGoal.save()
        .then(g => {
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
                    if ( parentGoal && parentGoal.id) {
                        if (index && index > -1) {
                            parentGoal.subGoals.splice(index + 1, 0, newGoalId);
                        } else {
                            parentGoal.subGoals.push(newGoalId);
                        }
                        return parentGoal.save();
                    }
                }).then(g => {
                    if (g && subGoal && subGoal.id) {
                        res.status(200).json({
                            message: 'Sub Goal added to goal with id: ' + g.id,
                            subGoalId: subGoal.id
                        });
                    } else {
                        res.status(500).json({ error: 'Error occured goal or sub Goal failed!'});
                    }
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
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
            Goal.find({ 'userId': req.userData.userId, '_id': m.goalId })
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
                .then(savedG => {res.status(200).json({
                    message: 'Habit added to goal with id: ' + g.id,
                })}).catch(err => {
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