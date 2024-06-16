const mongoose = require('mongoose');
const { StreaksList } = require('../models/computed/streaksList');

const habitSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: false },
    category: { type: Number, required: true },
    measure: { type: Number, required: true },
    priority: { type: Number, required: false, default: 5 },
    imagePath: { type: String, required: false },
    isNegative: { type: Boolean, required: false },
    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
    speeds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speed' }],
    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
    createdDate: { type: Date, required: true },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

habitSchema.virtual('streaks').get(function () {
    if (this.entries.length < 2) {
        return null;
    }
    var entriesSorted = this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    var previousEntry = entriesSorted[0];
    var intervalToCheck = 'daily';
    var streakList = new StreaksList(this._id, this.speeds[this.speeds.length - 1]);
    //taking the last speed here although we should take the appropriate one for the entry
    for (var entry of entriesSorted.slice(1)) {
        streakList.update(previousEntry, entry);
        previousEntry = entry;
    }
    return streakList.streaks;

});

var differenceBetweenDays = function (a1, b2) {
    var a = new Date(a1);
    var b = new Date(b2);
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    if (!a || !b) {
        return 0;
    }
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

module.exports = mongoose.model('Habit', habitSchema);
