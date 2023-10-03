const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.signUp = function (req, res, next) {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    error: 'Mail exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ error: err });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            userName: req.body.userName,
                            password: hash,
                            createdDate: Date.now()
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                console.log('---');
                                console.log(user);
                                res.status(201).json({ message: 'User created', user: result });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err });
                            });
                    }
                });
            }
        });

}