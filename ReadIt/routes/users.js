var express = require('express');
var usersRouter = express.Router();
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const he = require('he');

//validator
const { body, validationResult } = require('express-validator');

usersRouter.use(bodyParser.json());

//Register GET page
usersRouter.get('/register', function(req, res, next) {
  //if logged in
  if(req.user)
    res.redirect('/users/profile/'+req.user.username);
  else
    res.render('register', { pageTitle: 'Register' });
});

//Register POST
usersRouter.post('/register', [
  //TODO: If logged in -> abort and redirect to user page
  //Validate email -> can't be empty and must be valid email format
  body("email").trim().escape().notEmpty().withMessage("Email cannot be empty")
  .isEmail().withMessage("Invalid email"),

  //! NOTE: I assume body().escape() etc. change the actual value in body? i.e. req.body.email can later be used?

  //Validate username -> must be 4-30 characters and contain only a-z & 0-9 & _
  body("username").trim().escape().isLength({min: 4, max: 30}).withMessage("Username must be between 4 and 30 characters long")
  .matches('^[A-Z|a-z|0-9|_]+$').withMessage("Username can only contain characters a-z, 0-9 and _"), //only allowing a-z, 0-9 and _ for now //TODO: allow äö etc.
  
  //Validate password with password-validator schema
  body("password").isLength({min: 6, max: 100}).withMessage("Password must be 5-100 characters long")
  .matches(/\d/).withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one symbol"),

  //Validate password confirm
  body('password2').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }

    return true;
  })

  //validation over
], (req, res, next) => {
  const errors = validationResult(req);

  //if there were validation errors...
  if (!errors.isEmpty())
  {
    console.log(errors.array());

    //re-load page with errors
    res.render('register', {
      pageTitle: 'Register',
      errors: errors.array()
    });
  }
  else
  {
    //if there were no validation errors
    console.log("Valid fields received from Register");
    //Register new user
    //! username is made lowercase by passport-local-mongoose, displayName remains as given
    User.register(new User({displayName: req.body.username, email: req.body.email, username: req.body.username}), req.body.password, (err, user) => {
      if(err)
      {
        console.log(["User registration failed: " + err]);
        //re-load page with errors
        res.render('register', {
          pageTitle: 'Register',
          errors: [{msg: err}]
        });
      }
      else
      {
        passport.authenticate("local")(req, res, () => {
          res.redirect('/');
        });

      }
    });
  }
});


//Login GET page
usersRouter.get('/login', function(req, res, next) {
  //if logged in
  if(req.user)
    res.redirect('/users/profile/'+req.user.username);
  else
    res.render('login', { pageTitle: 'Login'});
});

//Login POST
usersRouter.post('/login', function(req, res, next) {
  //if logged in
  if(req.user)
    res.redirect('/users/profile/'+req.user.username);
  else
  {
    passport.authenticate('local', function(err, user, info) {
      if(err || !user)
      {
        //TODO: no real error reporting to user yet...
        console.log(err);
        console.log(user);
        res.render('login', {pageTitle: 'Login', errors: [{msg: "Invalid login"}]});
      }
      else
      {
        req.logIn(user, function(err) {
          if(err)
          {
            console.log(err);
            res.render('login', {pageTitle: 'Login', errors: [{msg: "Failed to login"}]});
          }
          else
          {
            return res.redirect('/users/profile/' + user.username);
          }
        });
      }
    })(req, res, next);
  }
});

//Logout GET
usersRouter.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//User page GET
usersRouter.get('/profile/:displayName', function(req, res, next) {
  User.findByUsername(req.params.displayName.toLowerCase()).then(function(FoundUser){
    console.log(FoundUser);

    //Found User
    let _jsonFoundUser = null, _jsonUser = null, _ownPage = false;
    if(FoundUser)
    {
      _jsonFoundUser = {
        username: FoundUser.username,
        displayName: FoundUser.displayName,
        email: FoundUser.email
      };
    }

    //Signed in user
    if(req.user)
    {
      _jsonUser = {
        username: req.user.username,
        displayName: req.user.displayName
      };
    }

    if(_jsonFoundUser && _jsonUser && _jsonFoundUser.username == _jsonUser.username)
    {
      console.log("own page");
      _ownPage = true;
    }

    Post.find({author: FoundUser._id})
    .populate('author')
    .populate({ path: 'comments.author' })
    .sort({'updatedAt': -1})
    .limit(10)
    .exec(function(err, posts) {
      let jsonifiedResult = null;
      if(err)
      {
        console.log(err);
        next(err);
      }
      else
      {
        jsonifiedResult = JSON.parse(JSON.stringify(posts));
      }
      console.log(jsonifiedResult);
      for (let index = 0; index < jsonifiedResult.length; index++) {
        jsonifiedResult[index].author = posts[index].author.displayName;
        jsonifiedResult[index].authorUrl = "/users/profile/" + posts[index].author.username;
        jsonifiedResult[index].title = he.decode(jsonifiedResult[index].title);
        jsonifiedResult[index].content = he.decode(jsonifiedResult[index].content);
        jsonifiedResult[index].numOfComments = jsonifiedResult[index].comments.length;
        jsonifiedResult[index].comments = jsonifiedResult[index].comments.splice(1); //remove all but the first comment from display. Could be changed later...
        jsonifiedResult[index].postTime = new Date(jsonifiedResult[index].createdAt).toLocaleString();
        jsonifiedResult[index].lastActivity = new Date(jsonifiedResult[index].updatedAt).toLocaleString();
        for(let i = 0; i < jsonifiedResult[index].comments.length; i++)
        {
          jsonifiedResult[index].comments[i].authorUrl = "/users/profile/" + jsonifiedResult[index].comments[i].author.username;
          jsonifiedResult[index].comments[i].author = jsonifiedResult[index].comments[i].author.displayName;
          jsonifiedResult[index].comments[i].postTime = new Date(jsonifiedResult[index].comments[i].createdAt).toLocaleString();
          jsonifiedResult[index].comments[i].lastActivity = new Date(jsonifiedResult[index].comments[i].updatedAt).toLocaleString();
          if(req.user)
          {
            let vote = jsonifiedResult[index].comments[i].votes.find((x) => x.user.toString() == req.user._id.toString());
            if(vote && vote.state == 1)
              jsonifiedResult[index].comments[i].upvoted = true;
            else if(vote && vote.state == -1)
              jsonifiedResult[index].comments[i].downvoted = true;
          }
        }
        if(req.user)
        {
          let vote = jsonifiedResult[index].votes.find((x) => x.user.toString() == req.user._id.toString());
          if(vote && vote.state == 1)
            jsonifiedResult[index].upvoted = true;
          else if(vote && vote.state == -1)
            jsonifiedResult[index].downvoted = true;
        }
      }
      console.log(jsonifiedResult);

      res.render('profile', {
        pageTitle: 'Profile Page: ' + _jsonFoundUser.displayName,
        user: _jsonUser,
        posts: jsonifiedResult,
        foundUser: _jsonFoundUser,
        ownPage: _ownPage,
        extraCSS: ["posts", "profile"],
        extraJS: ["posts"]
      });
    });
  }).catch(function(err) {
    console.log("error in findByUsername: " + err);
    next(err); //!not really sure what even happens when this is called here
  });
});


module.exports = usersRouter;