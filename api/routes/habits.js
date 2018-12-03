const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Habit = require('../models/habit');

router.get('/', checkAuth, (req, res, next) => {
    Habit.find()
    .select('_id name type')
    .exec()
    .then(docs => {
        console.log(docs);
        const response = {
            count: docs.length,
            habits: docs.map(doc => {
                return {
                    name: doc.name,
                    type: doc.type,
                    _id: doc._id,
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

router.post('/', checkAuth, (req, res, next) => {
    const habit = new Habit({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        comment: req.body.comment,
        type: req.body.type
    });
    habit.save()
    .then(res=> {
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
                res.status(404).json({message: 'No entry found for provided ID'});
            }
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:habitId',(req, res, next) => {
    const id = req.params.habitId;
    const updateOps = {};
    console.log(req.body);
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Habit.update({_id: id}, { $set : updateOps })
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.delete('/:habitId',(req, res, next) => {
    const id = req.params.habitId;
    Habit.findOneAndRemove({_id: id})
    .exec()
    .then(response => {
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

module.exports = router;