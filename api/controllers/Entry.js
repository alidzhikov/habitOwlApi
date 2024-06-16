const Entry = require('../models/entry');
const Habit = require('../models/habit');
const errorHelper = require('../validation/error');

exports.getEntries = (req, res, next) => {
    Entry.find()
        .select('_id userId habitId speedId goalId performance date createdDate')
        .exec()
        .then(entries => {
            res.status(200).json({
                entries: entries
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
                    .then(savedHabit =>
                        savedHabit.populate([
                            { path: 'speeds' },
                            { path: 'entries' }
                        ])
                    ).then(populateHabit => {
                        console.log(populateHabit.streaks);
                        res
                            .status(201)
                            .json({ message: 'Entry created successfully', entryId: entry._id, streaks: populateHabit.streaks });
                    }).catch(err => {
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
        .then(entry =>
            Habit.findById(entry.habitId).populate([
                { path: 'speeds' },
                { path: 'entries' }
            ]).then(habitWithStreak =>
                res.status(200).json({ message: 'Product updated!', entry: entry, streaks: habitWithStreak.streaks })
            )
        )
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
                //rollback here maybe? or no
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
                res.status(200).json({ message: 'No entry found!', entry: null });
            }
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};