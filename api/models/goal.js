const mongoose = require('mongoose');

const Milestone = require('../models/milestone');

const goalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true },
    description: { type: String, required: false },
    category: { type: Number, required: true },
    measure: { type: Number, required: false }, // reconsider
    engine: { type: Number, required: false },//later required true
    target: { type: Number, required: true },
    priority: { type: Number, required: true },
    createdDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    completionDate: { type: Date, required: false },
    milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
    subGoals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
    habits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habit' }],
});

/// goal is to read books 
// 
var autoPopulateMilestones = function (next) {
    this.populate({ path: 'milestones', model: 'Milestone' });
    this.populate({ path: 'subGoals', model: 'Goal' });
    this.populate({ path: 'habits', model: 'Habit' });
    next();
};
var deleteNestedGoals = function(next) {
    var id = this.getQuery()['_id'];
    GoalModel.findById(id).then(goal => {
        if (goal) {
            GoalModel.findById(goal.parentGoalId).then(pg => {
                pg.subGoals = pg.subGoals.filter(sgId => sgId.toString() !== id);
                pg.markModified('subGoals');
                pg.save().then(res => console.log(res)).catch(err => console.log(err));;
            })
            .catch(err => console.log(err));
            GoalModel.deleteMany({ '_id': { $in: goal.subGoals.map(s => s._id) } }).then(res => console.log(res)).catch(err => console.log(err));
            Milestone.deleteMany({ '_id': { $in: goal.milestones.map(m => m._id) } }).then(res => console.log(res)).catch(err => console.log(err));
        }
        next();
    }).catch(e => {console.log(e); next()});
};

goalSchema.pre('find', autoPopulateMilestones);
goalSchema.pre(['delete', 'remove', 'findAndRemove', 'deleteMany','deleteOne'], deleteNestedGoals);

const GoalModel = mongoose.model('Goal', goalSchema);
module.exports = GoalModel;

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }