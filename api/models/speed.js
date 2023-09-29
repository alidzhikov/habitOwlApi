const mongoose = require('mongoose');

const speedSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    habitId: mongoose.Schema.Types.ObjectId,
    goalId: mongoose.Schema.Types.ObjectId,
    createdDate: { type: Date, required: true},
    startDate: { type: Date, required: true},
    endDate: Date,
    priority: { type: Number, required: true },
    habitTimeFrame: { type: Number, required: true },
    repetitions: { type: Number, required: true},
    isActive: { type: Boolean, default: false }
});

module.exports = mongoose.model('Speed', speedSchema);
