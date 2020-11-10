const express = require('express');
const userRouter = express.Router();
const bodyParser = require('body-parser');
const session = require("express-session");

const Users = require('../models/users');
const { MongoError } = require('mongodb');

userRouter.use(bodyParser.json());

//POST for signup
userRouter.post("/signup", (req, res, next) => {
    console.log("Signup! Body: ");
    console.log(req.body);
    if(req.body.username && req.body.password)
    {
        console.log("trying to find user: " + req.body.username);
        Users.findOne({username: req.body.username})
        .then((user) => {
            if(user != null)
            {
                console.log("User " + req.body.username + " already exists!");
                var err = new Error("User " + req.body.username + " already exists!");
                err.status = 403;
                next(err);
            }
            else
            {
                console.log("Creating user...");
                //create new user
                return Users.create({username: req.body.username, password: req.body.password});
            }
        }).then((user) => {
            console.log(user);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({user: user});
        }).catch((err) => {
            console.log("caught some error?");
            next(err);
        });
    }
    else
    {
        console.log("username/password missing from body!");
        let err = new Error("username/password missing from body!");
        err.status = 403;
        next(err);
    }
})

//POST for login
userRouter.post("/login", (req, res, next) => {
    console.log("Session data: ", req.session);

    if(req.session.user && req.session.user == "logged in")
    {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text(html");
        res.end("<h1>You are already logged in!</h1>");
    }
    else
    {
        var authHeader = req.headers.authorization;
        if(authHeader == null)
        {
            console.log("No auth headers found!");
            res.setHeader("WWW-Authenticate", "Basic");
            let err = new Error("Not Authenticated!");
            err.status = 401;
            next(err);
        }
        else
        {
            let auth_string = authHeader.split(' ')[1];
            let decoded_auth_string = new Buffer.from(auth_string, "base64").toString();

            var username = decoded_auth_string.split(":")[0];
            var password = decoded_auth_string.split(":")[1];

            Users.findOne({username: username})
            .then((foundUser) => {
                if(foundUser == null)
                {
                    let err = new Error("Username " + username + " not found!");
                    err.status = 403;
                    next(err);
                }
                else if(foundUser.password != password)
                {
                    let err = new Error("Wrong password!");
                    err.status = 403;
                    next(err);
                }
                else if(foundUser.username == username && foundUser.password == password)
                {
                    console.log("Logged in succesfully as " + username);
                    req.session.user = "logged in";
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.end("<h1>Logged in!</h1>");
                }
            }).catch((err) => { next(err); });
        }
    }
});

//GET for logout
userRouter.get("/logout", (req, res, next) => {
    if(req.session)
    {
        //user logged in
        req.session.destroy();
        console.log("Session destroyed!");
        res.clearCookie("session-id");
        console.log("cookie cleared from response");
        res.redirect("/");
    }
    else
    {
        //user not logged in
        var err = new Error("You are not logged in!");
        err.status = 403;
        next(err);
    }
});

module.exports = userRouter;