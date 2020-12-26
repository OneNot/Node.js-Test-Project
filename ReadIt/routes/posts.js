var express = require('express');
const bodyParser = require('body-parser');
var postsRouter = express.Router();
const Post = require('../models/post');
const he = require('he');
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

  Post.find({})
  .populate('author')
  .sort({'updatedAt': -1})
  .limit(10)
  .exec(function(err, posts) {
    let jsonifiedResult = null;
    if(err)
    {
      console.log(err);
    }
    else
    {
      jsonifiedResult = JSON.parse(JSON.stringify(posts));

      for (let index = 0; index < jsonifiedResult.length; index++) {
        jsonifiedResult[index].author = posts[index].author.displayName;
        jsonifiedResult[index].authorUrl = "/users/profile/" + posts[index].author.username;
        jsonifiedResult[index].title = he.decode(jsonifiedResult[index].title);
        jsonifiedResult[index].content = he.decode(jsonifiedResult[index].content);
        jsonifiedResult[index].numOfComments = jsonifiedResult[index].comments.length;
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
    }

    res.render('posts', {
      pageTitle: 'Posts',
      user: jsonUser,
      extraCSS: ["posts"],
      posts: jsonifiedResult,
      extraJS: ["posts"]
    });
  });
});

postsRouter.get('/:postId', function(req, res, next) {
  Post.find({_id: req.params.postId})
  .populate('author')
  .exec(function(err, posts) {

    let _jsonUser;
    //Signed in user
    if(req.user)
    {
      _jsonUser = {
        username: req.user.username,
        displayName: req.user.displayName
      };
    }

    let jsonifiedResult = null;
    if(err)
    {
      console.log(err);
      next(err);
    }
    else
    {
      console.log(posts);
      jsonifiedResult = JSON.parse(JSON.stringify(posts[0]));
      console.log(jsonifiedResult);
      jsonifiedResult.author = posts[0].author.displayName;
      jsonifiedResult.authorUrl = "/users/profile/" + posts[0].author.username;
      jsonifiedResult.title = he.decode(jsonifiedResult.title);
      jsonifiedResult.content = he.decode(jsonifiedResult.content);
      jsonifiedResult.numOfComments = jsonifiedResult.comments.length;
      if(req.user)
        {
          let vote = jsonifiedResult.votes.find((x) => x.user.toString() == req.user._id.toString());
          if(vote && vote.state == 1)
            jsonifiedResult.upvoted = true;
          else if(vote && vote.state == -1)
            jsonifiedResult.downvoted = true;
        }
      console.log(jsonifiedResult);
    }
    res.render('post', {
      pageTitle: 'Post: ' + (jsonifiedResult ? jsonifiedResult.title : 'Not found'),
      user: _jsonUser,
      post: jsonifiedResult,
      extraCSS: ["posts", "post"],
      extraJS: ["posts"]
    });
  })
});

postsRouter.post('/:postId/vote', function(req, res, next) {

  //!This is meant to be done via AJAX, so responses are json

  console.log("upvote start");
  //Need to be signed in for this action
  if(req.user)
  {
    let wantedVote = req.body.vote;
    console.log("wantedVote is:" + wantedVote);

    //Make the vote
    Post.findById(req.params.postId, function(err, result) {
      if(err)
      {
        console.log(err);
        res.send({error: JSON.stringify(err)});
      }
      else
      {    
        let oldVoteIndex = result.votes.findIndex((x) => x.user.toString() == req.user._id.toString());
        let newVoteState = wantedVote;
        //if found old vote...
        if(oldVoteIndex >= 0)
        {
          //...update it
          if(result.votes[oldVoteIndex].state == wantedVote)
            result.votes[oldVoteIndex].state = newVoteState = 0; //if upvote/downvote is clicked when said vote is already active, remove it - i.e. neutral vote
          else
            result.votes[oldVoteIndex].state = wantedVote;
        }
        else
          result.votes.push({user: req.user._id, state: wantedVote}); //...else make new vote
        
        //count new score
        let newScore = 0;
        for(let i = 0; i < result.votes.length; i++)
          newScore+= result.votes[i].state;
        
        //update and save
        result.points = newScore;
        result.save();

        res.send({state: newVoteState, score: newScore}); //TODO: passing the state here directly because currently can't remove votes, only override. i.e. up <-> down, but can't return to zero state: FIX LATER? 
      }
    });
  }
  else
  {
    res.send({error: 'login'});
  }
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
      Post.create({author: req.user._id, title: req.body.title, content: req.body.content, tags: req.body.tags})
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