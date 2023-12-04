const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const GoalController = require('../controllers/Goal');

//router.get('/all', checkAuth, GoalController.getAllGoals);

router.get('/', checkAuth, GoalController.getGoals);

router.post('/:index', checkAuth, GoalController.createGoalOrSubgoal);

router.patch('/milestones/:index', checkAuth, GoalController.createMilestone);

router.patch('/habits/:goalId', checkAuth, GoalController.addHabitToGoal);

// router.get('/:goalId', checkAuth, GoalController.getGoalById);

router.patch('/update/:goalId', checkAuth, GoalController.updateGoal);

// router.patch('/speed/:goalId', checkAuth, GoalController.addSpeedToGoal);

router.delete('/:goalId/habits/:habitId', checkAuth, GoalController.removeHabitFromGoal);

router.delete('/:goalId', checkAuth, GoalController.deleteGoal);

module.exports = router;