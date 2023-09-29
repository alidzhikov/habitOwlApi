// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Act = require('../models/act');

// router.get('/', (req, res, next) => {
//     Act.find()
//     .select('_id habitId date fulfilled')
//     .exec()
//     .then(docs => {
//         console.log(docs);
//         const response = {
//             count: docs.length,
//             acts: docs.map(doc => {
//                 return {
//                     _id: doc._id,
//                     habitId: doc.habitId,
//                     date: doc.date,
//                     fulfilled: doc.fulfilled,
//                     request: {
//                         type: 'GET',
//                         url: 'http://localhost:3000/acts/' + doc.id
//                     }
//                 }
//             })
//         };
//         res.status(200).json(response);
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({error: err});
//     });
// });

// router.post('/', (req, res, next) => {
//     console.log(req.body);
//     const act = new Act({
//         _id: new mongoose.Types.ObjectId(),
//         habitId: req.body.habitId,
//         date: req.body.date,
//         createdAt: req.body.createdAt
//     });
//     // req.body.forEach(el => {
//     //     const act = new Act({
//     //         _id: new mongoose.Types.ObjectId(),
//     //         habitId: el.habitId,
//     //         date: el.date,
//     //         createdAt: el.createdAt
//     //     });
//     //     console.log(el);
//     //     console.log(act);
//     //     act.save()
//     // })
//     act.save().then(r => {
//         console.log(res);
//         res.status(200).json({
//             message: 'Handling POST requests to /acts ' + act.id,
//             createdAct: act
//         });
//     })
//     .catch(err=> { 
//         console.log(err);
//         res.status(500).json({error: err});
//     });
  
// });

// router.get('/:actId',(req, res, next) => {
//     const id = req.params.actId;
//     Act.findById(id)
//     .exec()
//     .then(doc => {
//         console.log(doc);
//         if(doc){
//             res.status(200).json(doc);   
//         }else{
//             res.status(404).json({message: 'No entry found for provided ID'});
//         }
//     })
//     .catch(err => { 
//         console.log(err);
//         res.status(500).json({error: err});
//     });
// });

// router.patch('/:actId',(req, res, next) => {
//     const id = req.params.actId;
//     const updateOps = {};
//     for(const ops of req.body){
//         updateOps[ops.propName] = ops.value;
//     }
//     Act.update({_id: id}, { $set : updateOps })
//     .exec()
//     .then(result => {
//         console.log(result);
//         res.status(200).json(result);
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({error: err});
//     });
// });

// router.delete('/:actId',(req, res, next) => {
//     const id = req.params.actId;
//     Act.findOneAndRemove({_id: id})
//     .exec()
//     .then(response => {
//         console.log(response);
//         res.status(200).json(response);
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({error: err});
//     });
// });

// module.exports = router;