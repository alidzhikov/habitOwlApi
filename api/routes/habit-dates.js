const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /habit-dates'
    });
});

router.post('/', (req, res, next) => {
    const habitDate = {
        habitId: req.body.habitId,
        date: req.body.date,
        achieved: req.body.achieved
    };
    res.status(200).json({
        message: 'Handling POST requests to /habit-dates',
        habitDate: habitDate    
    });
});

router.get('/:habitDateId',(req, res, next) => {
    const id = req.params.habitDateId;
    if(id === 'special'){
        res.status(200).json({
            message: 'You discovered the special ID',
            id: id
        });
    }else{
        res.status(200).json({
            message: 'You passed an ID',
            id: id
        });
    }
});

router.patch('/:habitDateId',(req, res, next) => {
    res.status(200).json({
        message: 'Updated habit-date'
    });
});

router.delete('/:habitDateId',(req, res, next) => {
    res.status(200).json({
        message: 'Deleted habit-date'
    });
});

module.exports = router;