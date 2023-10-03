const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email:  { 
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    userName: {type: String, required: true, unique: true},
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    address: String,
    gender: Number,
    password: { type: String, required: true},
    birthDate: { type: Date, required: false},
    createdDate: { type: Date, required: true},
});

module.exports = mongoose.model('User', userSchema);