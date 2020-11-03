//mitä se teki siel package.jsonissa?


//setup...
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const port = 3000;
const hostname = 'localhost';
const mongodbURL = "mongodb://127.0.0.1:27017/messagedb";
const mongooseConf = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}; //! weird... this HAS to be defined seperately. Passing the settings to .connect inline throws a SyntaxError??? I guess seperate is fine if not better anyways, but still weird

//connect to mongo
var connect = mongoose.connect(mongodbURL, mongooseConf);


//create express
var app = express();
app.use(morgan('dev'));

//use cookies
app.use(cookieParser()); //! tarvitaaks keksejä ees enää?

//use session
app.use(session({
    secret: "very very secret!",
    resave: false,
    saveUninitialized: false
}));

//basic authentication
app.use((req, res, next) => {
    console.log("Session data: ", req.session);

    if(req.session.user && req.session.user == "admin")
        next();
    else
    {
        var authHeader = req.headers.authorization;

        if(authHeader == null)
        {
            console.log("No auth headers found!");
            res.setHeader("WWW-Authenticate", "Basic");
            var err = new Error("Not Authenticated!");
            err.status = 401;
            next(err);
        }
        else
        {
            let auth_string = authHeader.split(' ')[1];
            let decoded_auth_string = new Buffer.from(auth_string, "base64").toString();

            var username = decoded_auth_string.split(":")[0];
            var password = decoded_auth_string.split(":")[1];

            if(username == "admin" && password == "password")
            {
                req.session.user = "admin";
                next();
            }
            else
            {
                console.log("Wrong username and/or password");
                res.setHeader("WWW-Authenticate", "Basic");
                var err = new Error("Not Authenticated!");
                err.status = 401;
                next(err);
            }

            next();
        }
    }
});

//get the routes and mount
const msgRouter = require('./routes/messageRouter');
app.use('/messages', msgRouter);

//create server
var server = http.createServer(app);

//start server
server.listen(port, hostname, function(){
    console.log("Server started!");
});
