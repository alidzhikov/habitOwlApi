const mongoose = require('mongoose');

const milestoneSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true },
    description: { type: String, required: false },
    target: { type: Number, required: true },
    createdDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    completionDate: { type: Date, required: false },
});

module.exports = mongoose.model('Milestone', milestoneSchema);
