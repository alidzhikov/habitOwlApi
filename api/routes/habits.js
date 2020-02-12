const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Habit = require('../models/habit');

router.get('/',  (req, res, next) => {
    Habit.find()
    .select('_id name comment category desiredFrequency reward createdAt')
    .exec()
    .then(docs => {
        console.log('-----------');
        console.log(docs);
        const response = {
            count: docs.length,
            habits: docs.map(doc => {
                return {
                    _id: doc._id,
                    name: doc.name,
                    comment: doc.comment,
                    category: doc.category,
                    desiredFrequency: doc.desiredFrequency,
                    reward: doc.reward,
                    createdAt: doc.createdAt,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/habits/' + doc.id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.post('/', (req, res, next) => {//checkAuth
    const habit = new Habit({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        comment: req.body.comment,
        category: req.body.category,
        desiredFrequency: req.body.desiredFrequency,
        reward: req.body.reward,
        createdAt: req.body.createdAt,
    });
    habit.save()
    .then(r => {
        console.log(res);
        res.status(200).json({
            message: 'Handling POST requests to /habits ' + habit.id,
            createdHabit: habit
        });
    })
    .catch(err=> { 
        console.log(err);
        res.status(500).json({error: err});
    });   
});

router.get('/:habitId',(req, res, next) => {
    const id = req.params.habitId;
    Habit.findById(id)
        .exec()
        .then(doc => {
            console.log(doc);
            if(doc){
                res.status(200).json(doc);   
            }else{
                res.status(404).json({message: 'No entry found for provided ID.'});
            }
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:habitId',(req, res, next) => {
    const id = req.params.habitId;
    console.log(req.body);
    const updateOps = {};
    console.log(updateOps);
    console.log("a/sa/d");
    Habit.updateOne({_id: id}, { $set : req.body })
    .exec()
    .then(result => {
        res.status(200).json({message: 'Succesfully updated habit.', updatedHabit: req.body});
    })
    .catch(err => {
        console.log("errr");
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.delete('/:habitId',(req, res, next) => {
    const id = req.params.habitId;
    Habit.findOneAndRemove({_id: id})
    .exec()
    .then(response => {
        res.status(200).json({message:'Succesfully deleted habit.'});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

module.exports = router;