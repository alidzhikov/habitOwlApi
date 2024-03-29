const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const HabitController = require('../controllers/Habit');

router.get('/all/:day', checkAuth, HabitController.getHabits);

router.post('/', checkAuth, HabitController.createHabit);

router.get('/:habitId', checkAuth, HabitController.getHabitById);

router.patch('/update/:habitId', checkAuth, HabitController.updateHabit);

router.patch('/speed/:habitId', checkAuth, HabitController.addSpeedToHabit);

router.put('/speed/:speedId', checkAuth, HabitController.editHabitSpeed);

router.delete('/:habitId', checkAuth, HabitController.deleteHabit);

module.exports = router;