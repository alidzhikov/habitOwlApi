const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const SpeedController = require('../controllers/Speed');

router.get('/:speedIdParams', checkAuth, SpeedController.getHabitSpeeds);

module.exports = router;