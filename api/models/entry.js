const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
    habitId: { type: String, required: true},
    userId: { type: String, required: true},
    performance: { type: Number, required: true},
    note: {type: String, required: false},
    date: { type: Date, required: true},
    createdDate: { type: Date, required: true},
});

module.exports = mongoose.model('Entry', entrySchema);