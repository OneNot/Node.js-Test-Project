const express = require('express');
const userRouter = express.Router();
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require('passport');
const f = require('../my_modules/MyFunctions');

const User = require('../models/user');
const { MongoError } = require('mongodb');

userRouter.use(bodyParser.json());

//POST for signup
userRouter.post("/signup", (req, res, next) => {
    console.log("Signup!");

    //Register new user
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if(err)
        {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({err: err});
        }
        else
        {
            passport.authenticate("local")(req, res, () => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({status: "Registration successful! User logged in!"});
            });

        }
    });
})

//POST for login
userRouter.post("/login", passport.authenticate("local"), (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({status: "User logged in."});
});
userRouter.get("/google", passport.authenticate("google"), {scope: ["profile", "email"]});

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
        next(f.CreateError("You are not logged in!", 403));
    }
});

module.exports = userRouter;