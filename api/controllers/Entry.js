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
    const newEntry = new Entry({
        userId: req.body.userId,
        habitId: req.body.habitId,
        goalId: req.body.goalId,
        speedId: req.body.speedId,
        performance: req.body.performance,
        date: req.body.date,
        createdDate: req.body.createdDate
    });
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

exports.editEntry = (req, res, next) => {
    console.log(req.body);
    const entryToEditId = req.params.entryId;
    let entryToEdit = Entry.findById(entryToEditId);
    const performance = req.body.performance;
    entryToEdit.then(entry => {
        console.log(JSON.stringify(entry));
        errorHelper.isItemFound(entry, 'entry');
        entry.performance = performance;
        return entry.save();
    })
    .then(result => {
        res.status(200).json({ message: 'Product updated!', entry: result });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getEntryByDate = (req, res, next) => {
    const entryToFindDate = new Date(req.params.entryDate);
    const entryToFindDateEndDay = new Date(entryToFindDate.getTime());
    entryToFindDate.setUTCHours(0, 0, 0, 0);
    entryToFindDateEndDay.setUTCHours(23, 59, 59, 999);
    Entry.find({
        date: {
            $gte: entryToFindDate,
            $lt: entryToFindDateEndDay
        }
    })
    .then(entry => {
        console.log(entry);
        if (entry && entry.length) {
            res.status(200).json({ message: 'Entry found!', entry: entry });
        } else {
            res.status(200).json({ message: 'No entry found!', entry: null});
        }
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};