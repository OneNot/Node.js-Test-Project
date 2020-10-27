//mitä se teki siel package.jsonissa?


//setup...
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const port = 3000;
const hostname = 'localhost';
const mongodbURL = "mongodb://127.0.0.1:27017/messagedb";

//connect to mongo
var connect = mongoose.connect(mongodbURL);

//create express
var app = express();
app.use(morgan('dev'));

//get the model for the messages

//get the routes and mount
const msgRouter = require('./routes/messageRouter');
app.use('/messages', msgRouter);

//create server
var server = http.createServer(app);

//start server
server.listen(port, hostname, function(){
    console.log("Server started!");
});
