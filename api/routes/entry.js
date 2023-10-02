const express = require('express');
const router = express.Router();
/* ignore warning */
const entryController = require('../controllers/Entry');

router.get('/', entryController.getEntries);

router.post('/', entryController.saveEntry);

router.put('/:entryId', entryController.editEntry);

router.get('/:entryDate', entryController.getEntryByDate);

module.exports = router;