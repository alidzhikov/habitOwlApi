const mongoose = require('mongoose');

const actSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    habitId:  { type: String, required: true},
    date:  { type: Date, required: false},
    createdAt: { type: Date, required: false},
    performance:  { type: Number, required: false},
});

module.exports = mongoose.model('Act', actSchema);