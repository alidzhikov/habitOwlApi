const mongoose = require('mongoose');

const speedSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
    title: { type: String, required: false },
    // goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: false }],
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: false },
    createdDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    priority: { type: Number, required: true },
    habitTimeFrame: { type: Number, required: true },
    repetitions: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
    status: { type: Number, required: true, default: 1 }
});

module.exports = mongoose.model('Speed', speedSchema);
