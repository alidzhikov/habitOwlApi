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

exports.signIn = (req, res, next) => {
    console.log(req.body.email);
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const jwtSecret = process.env.JWT_KEY;
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, jwtSecret, {
                        expiresIn: "1h"
                    });
                    return res.status(201).json({
                        message: 'Auth successful',
                        token: token,
                        user: user[0]
                    });
                }
                res.status(401).json({
                    message: 'Auth failed'
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.getUserByToken = function (req, res, next) {
    console.log(req.userData);
    const userId = req.userData && req.userData.userId;
    console.log(userId);
    if (!userId) {
        //modify later
        return res.status(404).json({
            error: 'No user found'
        });
    }
    User.findById(userId)
        .exec()
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {res.status(404)}  );
}