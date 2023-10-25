const Habit = require('../models/habit');
const Speed = require('../models/speed');
const helpers = require('../common/helpers');
const mongoose = require('mongoose');
const entryQueries = require('../queries/entry');
const errorHelper = require('../validation/error');

var twoDaysAgoDate = new Date();
twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 7);
const entriesPopulateOptions = {
    path: 'entries', select: '_id performance date createdDate', 
    match: {
        date: { $gte: twoDaysAgoDate }
    }, 
    options: {sort: '-date'}
};

exports.getHabits = (req, res, next) => {
    console.log(req.userData.userId);
    console.log('___GET HABITS _____')
    Habit.find({'userId': req.userData.userId})
        .select('_id userId title comment category measure createdDate speeds entries')
        .populate('speeds')
        .populate(entriesPopulateOptions)
    .exec()
    .then(docs => {
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
};

exports.getHabitById = (req, res, next) => {
    const id = req.params.habitId;
    Habit.findById(id)
        .populate('speeds')
        .populate(entriesPopulateOptions)
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
};

// exports.editHabit = (req, res, next) => {
   
//     console.log(req.body);
//     const habitToEditId = req.params.habitId;
//     let habitToEdit = Habit.findById(habitToEditId);

//     const title = req.body.title;
//     const comment = req.body.comment;
//     const category = req.body.category;

//     habitToEdit.then(habit => {
//         errorHelper.isItemFound(habit, 'habit');
//         habit.title = title;
//         habit.comment = comment;
//         habit.category = category;
//         habit.measure = measure;
//         return entry.save();
//     })
//     .then(result => {
//         res.status(200).json({ message: 'Product updated!', entry: result });
//     })
//     .catch(err => {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     });
// };

exports.updateHabit = (req, res, next) => {
    const habitId = req.params.habitId;
    //errorHelper.validationCheck(req);
    const title = req.body.title;
    const comment = req.body.comment;
    const category = req.body.category;

    Habit.findById(habitId)
        .then(habit => {
            errorHelper.isItemFound(habit, 'habit');
            habit.title = title;
            habit.comment = comment;
            habit.category = category;
            return habit.save();
        })
        .then(habit => {
            let updatedSpeed;
            req.body.speeds.map(speedModified => {
                entryQueries.getEntriesBySpeedId(speedModified.id)
                    .then(entries => {
                        console.log('ntries')
                        console.log(entries)
                        // later disable the fields if the speed has entries to it or maybe give a choice to remove all the entries if modification is required
                        const speedToSave = Speed.findById(speedModified.id)
                            .then(speed => {
                                let skipList = [];
                                if (!entries.length) {
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

exports.deleteHabit = (req, res, next) => {
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
};
