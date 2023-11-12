const Goal = require('../models/goal');

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

exports.createGoal = (req, res, next) => {
    const newGoalId = new mongoose.Types.ObjectId();
    const goal = new Goal({
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
    });
    goal.save()
        .then(g => {
            Goal.find({'userId': req.userData.userId, '_id': g.parentGoalId}).then((res) => {
                let parentGoal = res[0];
                if (parentGoal && parentGoal.id) {
                    parentGoal.milestones.unshift(g._id);
                    parentGoal.save();
                }
            }).then(g=> {
                res.status(200).json({
                    message: 'Handling POST requests to /goals ' + goal.id,
                    createdGoalId: goal._id
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deleteGoal = (req, res, next) => {
    const id = req.params.goalId;
    let i = 1;
    let milestoneToDelete = [];
    while (req.query['goalId' + i]) {
        milestoneToDelete.push(req.query['goalId' + i]);
        i++;
    }
    Goal.deleteMany({'_id':{$in: milestoneToDelete}}).then(r => console.log('Milestones deleted ' + milestoneToDelete )).catch(e => console.log(e));

    Goal.findOneAndRemove({_id: id})
    .exec()
    .then(response => {
        res.status(200).json({message:'Succesfully deleted goal.'});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
};