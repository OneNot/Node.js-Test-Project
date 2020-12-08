var passport = require('passport');

// This is the local strategy-class
var LocalStrategy = require('passport-local').Strategy;

// This is the Google Oauth2.0 strategy-class
//const GoogleStrategy = require('passport-google-oauth20').Strategy;

// This is the user schema
var User = require('./models/user');

// Tell passport to use the local strategy
//passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));


/*
// Get our keys from keys.js
const keys = require('./config/keys');

passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
    }, (accessToken, refreshToken, profile, done)=> {
        User.findOrCreate({googleId: profile.id}, (err, user) => {
                return done(err, user);
        })
    })
);
*/

// These are the (de-)serializiation methods
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//TODO: This is used to actually do the authentication? -> should I put it in some place I can call it easily in only the places where authentication is required?
/*
function auth(req, res, next){
  //console.log(req.headers);
  if (req.user){  // is the user data included in the request?
      next();
  }
  else {
      var err = new Error('Not authenticated!');
      err.status = 403;
      next(err);
  }
}
*/
