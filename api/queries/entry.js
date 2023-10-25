const Entry = require('../models/entry');

exports.getEntriesBySpeedId = function (speedId) {
    return Entry.find({'speedId': speedId}).exec();
};