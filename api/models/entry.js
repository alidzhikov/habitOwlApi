const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
    speedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Speed', required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performance: { type: Number, required: true },
    note: { type: String, required: false },
    date: { type: Date, required: true },
    createdDate: { type: Date, required: true },
});

module.exports = mongoose.model('Entry', entrySchema);