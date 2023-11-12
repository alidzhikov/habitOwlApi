const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const habitRoutes = require('./api/routes/habits');
const entryRoutes = require('./api/routes/entry');
const userRoutes = require('./api/routes/users');
const goalRoutes = require('./api/routes/goal');
// const env = require('./api/env.js');
const localDb='mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1';

const remoteDb='mongodb+srv://admin:lQ6Uv2tg7dSoLPea@howlcluster0.9efltcs.mongodb.net/?retryWrites=true&w=majority';
const options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 3, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  }

const connectWithRetry = () => {
  console.log('MongoDB connection with retry ' + process.env.MONGODB_PASS )//              EGVdTmvU1JgnJtoS 	
  mongoose.connect(remoteDb, { useNewUrlParser: true })
  .then(()=>{
    console.log('MongoDB is connected');

  }).catch(err=>{
    console.log(err);
    
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
    setTimeout(connectWithRetry, 5000)
  })
}

connectWithRetry();

// var asd = [
//   {"name":"Workout","comment":"its good for ya","category":{"$numberInt":"2"},"desiredFrequency":{"$numberInt":"1"},"createdAt":{"$date":{"$numberLong":"1545070498219"}},"__v":{"$numberInt":"0"}},
//   {"name":"Meditate","comment":"30min atleast","category":{"$numberInt":"3"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070513654"}},"__v":{"$numberInt":"0"}},
//   {"name":"Life purpose","comment":"Self inquiry, journaling, contemplation","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070538425"}},"__v":{"$numberInt":"0"}},
//   {"name":"Read books","comment":"Atleast 30 minutes ","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070572742"}},"__v":{"$numberInt":"0"}},
//   {"name":"Vizualizations","comment":"For now do 2 for 10 mins","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070796437"}},"__v":{"$numberInt":"0"}},
//   {"name":"Affirmations","comment":"Do 5 every day for 5 mins confidence independent learn fast, ppl,creative","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070840699"}},"__v":{"$numberInt":"0"}},
//   {"name":"Code skills","comment":"every day for 30 or 1hr","category":{"$numberInt":"0"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070902563"}},"__v":{"$numberInt":"0"}},
//   {"name":"Robotics","comment":"Improve skills in robotics","category":{"$numberInt":"0"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545070979967"}},"__v":{"$numberInt":"0"}},
//   {"name":"Journal","comment":"atleast 10 mins","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071050415"}},"__v":{"$numberInt":"0"}},
//   {"name":"Contemplate","comment":"for a subject","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"3"},"createdAt":{"$date":{"$numberLong":"1545071063874"}},"__v":{"$numberInt":"0"}},
//   {"name":"Gratitude","comment":"5 statements","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071084484"}},"__v":{"$numberInt":"0"}},
//   {"name":"Review goals","comment":"Twice a day","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071194868"}},"__v":{"$numberInt":"0"}},
//   {"name":"No sugar","comment":"Natural sugars are allowed like from fruits","category":{"$numberInt":"2"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071239810"}},"__v":{"$numberInt":"0"}},
//   {"name":"No prom","comment":"not even glimps","category":{"$numberInt":"4"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071252548"}},"__v":{"$numberInt":"0"}},
//   {"name":"No salty junk","comment":"Like chips and fried stuff","category":{"$numberInt":"2"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071265542"}},"__v":{"$numberInt":"0"}},
//   {"name":"Approach girls","comment":"for now 1 girl a week is cool","category":{"$numberInt":"4"},"desiredFrequency":{"$numberInt":"3"},"createdAt":{"$date":{"$numberLong":"1545071361331"}},"__v":{"$numberInt":"0"}},
//   {"name":"In bed before 00:00","comment":"go early for now 00:00 while the kuzs are here","category":{"$numberInt":"2"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545071517848"}},"__v":{"$numberInt":"0"}},
//   {"name":"10 ideas ","comment":"","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1545073011567"}},"__v":{"$numberInt":"0"}},
//   {"name":"Logged in","comment":"","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1546006334542"}},"__v":{"$numberInt":"0"}},
//   {"name":"dw read","comment":"prepare for license exam for dmw","category":{"$numberInt":"0"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1564603312547"}},"__v":{"$numberInt":"0"}},
//   {"name":"Cold shower","comment":"Not warm but cold water","category":{"$numberInt":"2"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1565032505808"}},"__v":{"$numberInt":"0"}},
//   {"name":"No social scroll","comment":"No scrolling in social media messages are allowed","category":{"$numberInt":"1"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1565032533232"}},"__v":{"$numberInt":"0"}},
//   {"name":"Machine Learning","comment":"Small progress is sufficent for now","category":{"$numberInt":"0"},"desiredFrequency":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1570478397082"}},"__v":{"$numberInt":"0"}}
  
// ];
// asd = JSON.parse(asd);
// const Habit = require('./api/models/habit');
// Habit.collection.insertMany(asd, function onInsert(err, docs) {
//   if (err) {
//       console.log(err);
//   } else {
//       console.info('%d potatoes were successfully stored.', docs.length);
//   }
// });

app.use(morgan('dev'));
app.use(express.urlencoded());
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method =='OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/habits', habitRoutes);
app.use('/entry', entryRoutes);
app.use('/user', userRoutes);
app.use('/goals', goalRoutes);

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