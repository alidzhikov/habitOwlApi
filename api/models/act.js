const mongoose = require('mongoose');

const actSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    habitId:  { type: Number, required: true},
    date:  { type: Date, required: false},
    fulfilled: { type: Boolean, required: true}
});

module.exports = mongoose.model('Act', actSchema);