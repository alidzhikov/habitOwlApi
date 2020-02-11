const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:  { type: String, required: true},
    comment:  { type: String, required: false},
    category: { type: Number, required: true},
    desiredFrequency: { type: Number, required: true},
    reward: { type: Number, required: false},
    createdAt: { type: Date, required: true},
});

module.exports = mongoose.model('Habit', habitSchema);

//"MONGO_ATL_PW": "wkXhtBD41uq7maw8"