const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

//Tell passport to use local strategy
//passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));

const keys = require("./config/keys");

passport.use(new GoogleStrategy({
    //TODO: what goes here?
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());