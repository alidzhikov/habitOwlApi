const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const errorHelper = require('../validation/error');
const Habit = require('../models/habit');
const Speed = require('../models/speed');

router.get('/',  (req, res, next) => {
    var twoDaysAgoDate = new Date();
  
    twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 7);
    // console.log(d.toString());
   // console.log(twoDaysAgoDate.getDate())

    Habit.find()
        .select('_id userId title comment category measure createdDate speeds entries')
        .populate('speeds')
        .populate({
            path: 'entries', select: '_id performance date createdDate', 
            match: {
                date: { $gte: twoDaysAgoDate }
            }, 
            options: {sort: '-date'}
        })
    .exec()
    .then(docs => {
        console.log('-----------');
        console.log(docs);
        console.log('-----------');
        const response = {
            count: docs.length,
            habits: docs.map(doc => {
                return {
                    _id: doc._id,
                    userId: doc.userId,
                    title: doc.title,
                    comment: doc.comment,
                    category: doc.category,
                    measure: doc.measure,
                    speeds: doc.speeds,
                    entries: doc.entries,
                    createdDate: doc.createdDate
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
    console.log('CREATING A HABIT POST REQUEST-------------------------')
    console.log(req.body);
    const newHabitId = new mongoose.Types.ObjectId();
    var newSpeed;
    req.body.speeds.map(speed => {
        console.log(speed);
        newSpeed = new Speed({
            _id: new mongoose.Types.ObjectId(),
            userId: speed.userId,
            habitId: newHabitId,
            goalId: null,
            createdDate: speed.createdDate,
            startDate: speed.startDate,
            endDate: speed.endDate,
            priority: speed.priority,
            habitTimeFrame: speed.habitTimeFrame,
            repetitions: speed.repetitions,
            isActive: true
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
            habit.save().then(r => {
                console.log(res);
                res.status(200).json({
                    message: 'Handling POST requests to /habits ' + habit.id,
                    createdHabitId: habit._id 
                });
            })
            .catch(err=> { 
                console.log(err);
                res.status(500).json({error: err});
            });   
    } );
    console.log(newSpeed);
   
});
// use next always
router.get('/:habitId', (req, res, next) => {
    const id = req.params.habitId;
    Habit.findById(id)
        .populate('speeds')
        .populate('entries')
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


router.patch('/update', (req, res, next) => {
    console.log(req.body);
    const habitId = req.params.habitId;
    errorHelper.validationCheck(req);
    const title = req.body.title;
    const comment = req.body.comment;
    const category = req.body.category;
  
    Habit.findById(habitId)
      .then(habit => {
        errorHelper.isItemFound(habit, 'habit');
        //errorHelper.isUserAuthorized(req);
        habit.title = title;
        habit.comment = comment;
        habit.category = category;
        return habit.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Habit updated!', habit: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
});

router.delete('/:habitId',(req, res, next) => {
    console.log(req.params);
    const id = req.params.habitId;
    let i = 1;
    let speedsToDelete = [];
    while (req.query['speedId' + i]) {
        speedsToDelete.push(req.query['speedId' + i]);
        i++;
    }
    Speed.deleteMany({'_id':{$in: speedsToDelete}}).then(r => console.log('Speeds deleted ' + speedsToDelete )).catch(e => console.log(e));

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