const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true },
    description: { type: String, required: false },
    category: { type: Number, required: true },
    measure: { type: Number, required: true },
    target: { type: Number, required: true },
    priority: { type: Number, required: true },
    createdDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    completionDate: { type: Date, required: false },
    milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
    habits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habit' }],
});
var autoPopulateMilestones = function (next) {
    this.populate('milestones');
    next();
};

goalSchema.pre('find', autoPopulateMilestones);

module.exports = mongoose.model('Goal', goalSchema);
