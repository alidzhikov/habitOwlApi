const express = require('express');
const router = express.Router();
const User = require('../models/user');
const userController = require('../controllers/User');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', userController.signUp);

router.post('/signin', userController.signIn);

router.get('/details', checkAuth, userController.getUserByToken);

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