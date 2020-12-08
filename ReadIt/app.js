//requires
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const expressValidator = require('express-validator');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const morgan = require('morgan');
const flash = require('connect-flash');


//DB connection
const url = "mongodb://127.0.0.1:27017/readit";
const options = {
    useNewUrlparser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};
mongoose.connect(url, options);
var DBConnection = mongoose.connection;


//routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


//Init App
var app = express();


//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


//Dev logging
app.use(morgan('dev'));


//Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Express session
app.use(expressSession({
  secret: "salaisuus",
  resave: false,
  saveUninitialized: false
}));


//Passport init
app.use(passport.initialize());
app.use(passport.session());


//TODO: Add Middleware for express-validator?


//Connect Flash
app.use(flash());


//! Not sure what this is for yet. Does it override the flash messages sent by passport??
//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//Set Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);


//! I don't understand how this works, but I'll leave it here anyways for now
//#region ========== Some kind of error handling =============
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//#endregion ==================================================


//add the app to exports so that the mysterious www launcher system can require it
//port is set and server started in www apparently (www requires app.js first thing)
module.exports = app;





//! Note: There are some probably breaking changes in the old code
//=============OLD===============
// var createErroconst path = require('path');r = require('http-errors');
// var express = require('express');
// const expressHandlebars = require('express-handlebars');
// const expressValidator = require('express-validator');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
// const passport = require('passport');
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// //view engine stup
// app.engine('handlebars', expressHandlebars());
// app.set('view engine', 'handlebars');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// //passport stuff
// app.use(passport.initialize()); 
// app.use(passport.session()); 


// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;