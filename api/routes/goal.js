const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const GoalController = require('../controllers/Goal');

//router.get('/all', checkAuth, GoalController.getAllGoals);

router.get('/', checkAuth, GoalController.getGoals);

router.get('/track', checkAuth, GoalController.getTrackedGoals);

router.post('/:index', checkAuth, GoalController.createGoalOrSubgoal);

router.patch('/milestones/edit/:milestoneId', checkAuth, GoalController.editMilestone);

router.delete('/milestones/remove/:milestoneId/:goalId', checkAuth, GoalController.removeMilestone);

router.patch('/milestones/:index', checkAuth, GoalController.createMilestone);

router.patch('/habits/:goalId', checkAuth, GoalController.addHabitToGoal);

// router.get('/:goalId', checkAuth, GoalController.getGoalById);

router.patch('/update/:goalId', checkAuth, GoalController.updateGoal);

router.patch('/speeds/:goalId', checkAuth, GoalController.addSpeedToGoal);

router.delete('/:goalId/habits/:habitId', checkAuth, GoalController.removeHabitFromGoal);

router.delete('/:goalId', checkAuth, GoalController.deleteGoal);

module.exports = router;