const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:  { type: String, required: true},
    comment:  { type: String, required: false},
    type: { type: String, required: true} //later to enum
});

module.exports = mongoose.model('Habit', habitSchema);

//"MONGO_ATL_PW": "wkXhtBD41uq7maw8"