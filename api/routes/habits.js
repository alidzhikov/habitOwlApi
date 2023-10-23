const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const errorHelper = require('../validation/error');
const Habit = require('../models/habit');
const Speed = require('../models/speed');
const HabitController = require('../controllers/Habit');

const entriesPopulateOptions = {
    path: 'entries', select: '_id performance date createdDate', 
    options: {sort: '-date'}
};

router.get('/', checkAuth, HabitController.getHabits);

router.post('/', checkAuth, HabitController.createHabit);
// use next always
router.get('/:habitId', checkAuth, HabitController.getHabitById);

//router.put('/:habitId', checkAuth, HabitController.editHabit);

router.patch('/update/:habitId', checkAuth, HabitController.updateHabit);

router.delete('/:habitId', checkAuth, HabitController.deleteHabit);

module.exports = router;