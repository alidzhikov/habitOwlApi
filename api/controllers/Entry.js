const Entry = require('../models/entry');
const Habit = require('../models/habit');
const errorHelper = require('../validation/error');

exports.getEntries = (req, res, next) => {
    Entry.find()
        .select('_id userId habitId performance date createdDate')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                habits: docs.map(doc => {
                    return {
                        _id: doc._id,
                        userId: doc.userId,
                        habitId: doc.habitId,
                        performance: doc.performance,
                        date: doc.date,
                        createdDate: doc.createdDate
                    }
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.saveEntry = (req, res, next) => {
    console.log(req.body);
    const newEntry = new Entry({
        userId: req.body.userId || 1,
        habitId: req.body.habitId,
        performance: req.body.performance,
        date: req.body.date,
        createdDate: req.body.createdDate
    });
    var sj = new Date();
    console.log('===================== DATE now ');
    console.log(sj.toISOString());
    console.log(sj.toString());
    console.log(sj.toLocaleString());
    console.log(sj.toUTCString());
    console.log('===================== req.body.date');
    var sj = new Date(req.body.date);
    console.log(sj.toISOString());
    console.log(sj.toString());
    console.log(sj.toLocaleString());
    console.log(sj.toUTCString());
    newEntry
        .save()
        .then(entry => {
            Habit.findById(newEntry.habitId).then(habit => {
                habit.entries.push(newEntry._id);
                habit
                    .save()
                    .then(savedHabit => {
                        res
                            .status(201)
                            .json({ message: 'Entry created successfully', entryId: entry._id });
                    }).catch(e => {
                        console.log(err);
                        next(err);
                    });
            })


        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};
