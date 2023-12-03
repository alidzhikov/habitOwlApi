const Habit = require('../models/habit');
const Speed = require('../models/speed');
const mongoose = require('mongoose');

exports.getHabitSpeeds = (req, res, next) => {
    const speedIdParams = req.params.speedIdParams;
    if (!speedIdParams) {
        //when to return which status code?????/
        err.statusCode = 500;
        return next();
    }
    const speedIds = speedIdParams.split(',');
    Speed.find({'_id': {$in: speedIds}})
        .populate('goals')
        .then(result => {
            res.status(200).json({habitSpeeds: result});
        })
        .catch(err => {
            err.statusCode = 500;
            next();
        });
};