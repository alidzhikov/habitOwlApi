const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const HabitController = require('../controllers/Habit');

router.get('/', checkAuth, HabitController.getHabits);

router.post('/', checkAuth, HabitController.createHabit);

router.get('/:habitId', checkAuth, HabitController.getHabitById);

router.patch('/update/:habitId', checkAuth, HabitController.updateHabit);

router.delete('/:habitId', checkAuth, HabitController.deleteHabit);

module.exports = router;