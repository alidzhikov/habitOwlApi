const mongoose = require('mongoose');

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
});

module.exports = mongoose.model('Habit', habitSchema);
