const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entry');

router.get('/', entryController.getEntries);

router.post('/', entryController.saveEntry);

module.exports = router;