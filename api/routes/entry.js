const express = require('express');
const router = express.Router();
const entryController = require('../controllers/Entry');

router.get('/', entryController.getEntries);

router.post('/', entryController.saveEntry);

module.exports = router;