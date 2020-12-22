var express = require('express');
const bodyParser = require('body-parser');
var postsRouter = express.Router();
const Post = require('../models/post');
//validator
const { body, validationResult } = require('express-validator');

postsRouter.use(bodyParser.json());



postsRouter.get('/', function(req, res, next) {
  console.log(req.user);
  let jsonUser = null;
  if(req.user)
  {
    jsonUser = {
      username: req.user.username,
      displayName: req.user.displayName
    };
  }
  res.render('posts', { pageTitle: 'Posts', user: jsonUser, extraCSS: ["posts"]});
});

postsRouter.get('/create-post', function(req, res, next) {
  console.log(req.user);
  if(!req.user)
    res.redirect('/users/login'); //if not logged in, re-direct to login
  else
  {
    let jsonUser = {
      username: req.user.username,
      displayName: req.user.displayName
    };
    res.render('create-post', {pageTitle: "Create Post", user: jsonUser, extraCSS: ["create-post"], extraJS: ["create-post"]});
  }
});

postsRouter.post('/create-post', [
  //Validation
  body('title').trim().escape().notEmpty().withMessage("Title cannot be empty"),
  body('content').escape().notEmpty().withMessage("Content cannot be empty"),
  //TODO: Should validate tags too... Probably check that all of them are allowed tags
], (req, res, next) => {
  //Validation done
  if(!req.user)
    res.redirect('/users/login'); //if not logged in, re-direct to login
  else
  {
    console.log("Validation done");
    var errors = validationResult(req);
    //if there were validation errors...
    if (!errors.isEmpty())
    {
      console.log("Validation Errors:");
      console.log(errors.array());

      //re-load page with errors
      res.render('create-post', {
        pageTitle: "Create Post",
        user: jsonUser,
        extraCSS: ["create-post"],
        extraJS: ["create-post"],
        errors: errors.array()
      });
    }
    else
    {
      //No validation errors
      console.log("No validation errors, starting to create doc");
      Post.create({author: req.user.username, title: req.body.title, content: req.body.content, tags: req.body.tags})
      .then((msg) => {
        console.log("doc created");
        //TODO: redirect to newly created post
        res.redirect('/posts');
      }).catch((err) => {
        //re-load page with errors
        console.log("error creating doc");
        console.log(err);
        res.render('create-post', {
          pageTitle: "Create Post",
          user: jsonUser,
          extraCSS: ["create-post"],
          extraJS: ["create-post"],
          errors: [{msg: err}] //not sure if this works
        });
        //next(err);
      });
    }
  }
});

module.exports = postsRouter;