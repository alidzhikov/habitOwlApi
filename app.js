const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const habitRoutes = require('./api/routes/habits');
const habitDateRoutes = require('./api/routes/habit-dates');
const userRoutes = require('./api/routes/users');


const options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 3, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  }

const connectWithRetry = () => {
  console.log('MongoDB connection with retry')
  mongoose.connect("mongodb+srv://ogi-user-007:75HN3ikuVnyFxjVl@habitowl0-cfcie.mongodb.net/test", { useNewUrlParser: true })
  .then(()=>{
    console.log('MongoDB is connected')
  }).catch(err=>{
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
    setTimeout(connectWithRetry, 5000)
  })
}

connectWithRetry();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if(req.method =='OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/habits', habitRoutes);
app.use('/habit-dates', habitDateRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;