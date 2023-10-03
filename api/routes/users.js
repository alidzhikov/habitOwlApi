const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
/* ignore warning */
const userController = require('../controllers/User');

router.post('/signup', userController.signUp);

router.post('/login', (req, res, next) => {
    console.log(req.body.email);
    User.find({email: req.body.email })
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
                }, jwtSecret,{
                    expiresIn: "1h"
                });
                return res.status(201).json({
                    message: 'Auth successful',
                    token: token,
                    user: user
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
});

router.delete('/:userId', (req, res, next) => {
    User.findOneAndRemove({ _id: req.params.userId })
    .exec()
    .then(result => {
        res.status(200).json({message: "User deleted"});
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;