const Habit = require('../models/habit');
//const mongoose = require('mongoose');

var twoDaysAgoDate = new Date();
twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 7);
const entriesPopulateOptions = {
    path: 'entries', select: '_id performance date createdDate', 
    match: {
        date: { $gte: twoDaysAgoDate }
    }, 
    options: {sort: '-date'}
};


exports.getHabits =  (req, res, next) => {
    console.log(req.userData.userId);
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