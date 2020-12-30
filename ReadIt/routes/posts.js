var express = require('express');
const bodyParser = require('body-parser');
var postsRouter = express.Router();
const Post = require('../models/post');
const he = require('he');
//validator
const { body, validationResult } = require('express-validator');
const post = require('../models/post');
const { param } = require('./users');

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
  .populate({ path: 'comments.author' })
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

      //sort comments by date
      posts.forEach(post => {
        post.comments.sort(function(a,b){
          return new Date(b.createdAt) - new Date(a.createdAt); //creating objects inside the sort function possibly not great, but whatever
        });
      });

      jsonifiedResult = JSON.parse(JSON.stringify(posts));

      for (let index = 0; index < jsonifiedResult.length; index++)
      {
        jsonifiedResult[index].author = posts[index].author.displayName;
        jsonifiedResult[index].authorUrl = "/users/profile/" + posts[index].author.username;
        jsonifiedResult[index].title = he.decode(jsonifiedResult[index].title);
        jsonifiedResult[index].content = he.decode(jsonifiedResult[index].content);
        if(jsonifiedResult[index].image)
          jsonifiedResult[index].image = he.decode(jsonifiedResult[index].image);

        jsonifiedResult[index].numOfComments = jsonifiedResult[index].comments.length;

        jsonifiedResult[index].comments.splice(1); //remove all but the first comment from display. Could be changed later...

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
            jsonifiedResult[index].comments[i].userIsAuthor = (req.user._id.toString() == posts[index].comments[i].author._id.toString() ? true : false);

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
  body('image').escape()
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
      Post.create({author: req.user._id, title: req.body.title, image: req.body.image, content: req.body.content, tags: req.body.tags})
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

postsRouter.get('/:postId', function(req, res, next) {
  //TODO: order comments by date
  console.log("POSTID GET CALLED");
  Post.find({_id: req.params.postId})
  .populate('author')
  .populate({ path: 'comments.author' })
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
    else if(posts && posts[0])
    {
      console.log("POSTS:");
      console.log(posts);

      //sort comments by date
      posts[0].comments.sort(function(a,b){
        return new Date(b.createdAt) - new Date(a.createdAt); //creating objects inside the sort function possibly not great, but whatever
      });

      jsonifiedResult = JSON.parse(JSON.stringify(posts[0]));
      console.log(jsonifiedResult);
      jsonifiedResult.author = posts[0].author.displayName;
      jsonifiedResult.authorUrl = "/users/profile/" + posts[0].author.username;
      jsonifiedResult.title = he.decode(jsonifiedResult.title);
      jsonifiedResult.content = he.decode(jsonifiedResult.content);
      if(jsonifiedResult.image)
        jsonifiedResult.image = he.decode(jsonifiedResult.image);
      jsonifiedResult.numOfComments = jsonifiedResult.comments.length;
      jsonifiedResult.postTime = new Date(jsonifiedResult.createdAt).toLocaleString();
      jsonifiedResult.lastActivity = new Date(jsonifiedResult.updatedAt).toLocaleString();

      for(let i = 0; i < posts[0].comments.length; i++)
      {
        jsonifiedResult.comments[i].author = posts[0].comments[i].author.displayName;
        jsonifiedResult.comments[i].authorUrl = "/users/profile/" + posts[0].comments[i].author.username;
        jsonifiedResult.comments[i].postTime = new Date(jsonifiedResult.comments[i].createdAt).toLocaleString();
        jsonifiedResult.comments[i].lastActivity = new Date(jsonifiedResult.comments[i].updatedAt).toLocaleString();
        if(req.user)
        {
          jsonifiedResult.comments[i].userIsAuthor = (req.user._id.toString() == posts[0].comments[i].author._id.toString() ? true : false);

          let vote = jsonifiedResult.comments[i].votes.find((x) => x.user.toString() == req.user._id.toString());
          if(vote && vote.state == 1)
            jsonifiedResult.comments[i].upvoted = true;
          else if(vote && vote.state == -1)
            jsonifiedResult.comments[i].downvoted = true;
        }
      }
      if(req.user)
      {
        jsonifiedResult.userIsAuthor = (req.user._id.toString() == posts[0].author._id.toString() ? true : false);
        let vote = jsonifiedResult.votes.find((x) => x.user.toString() == req.user._id.toString());
        if(vote && vote.state == 1)
          jsonifiedResult.upvoted = true;
        else if(vote && vote.state == -1)
          jsonifiedResult.downvoted = true;
      }
      console.log("Jsonified post:");
      console.log(jsonifiedResult);
    }
    res.render('post', {
      pageTitle: 'Post: ' + (jsonifiedResult ? jsonifiedResult.title : 'Not found'),
      user: _jsonUser,
      post: jsonifiedResult,
      extraCSS: ["posts", "post"],
      extraJS: ["posts", "post-reply"]
    });
  })
});

postsRouter.post('/:postId/delete', function(req, res, next) {
  console.log("post delete start");
  //Need to be signed in for this action
  if(req.user)
  {
    Post.findOneAndDelete({_id: req.params.postId, author: req.user._id}, function(err, result) {
      if(err)
      {
        console.log("Post not found or not owned by current user");
        res.redirect('/posts/'+req.params.postId);
      }
      else
      {
        console.log("Deletetion successful");
        res.redirect('/posts');
      }
    });
  }
  else
  {
    res.send({error: 'login'});
  }
});

postsRouter.get('/:postId/edit', function(req, res, next) {
  console.log("post edit called");
  console.log(req.user);
  if(!req.user)
    res.redirect('/users/login'); //if not logged in, re-direct to login
  else
  {
    let jsonUser = {
      username: req.user.username,
      displayName: req.user.displayName
    };
    console.log("finding post...");
    Post.findById(req.params.postId, function(err, foundPost) {
      if(err)
      {
        console.log(err);
        next(err);
      }
      else
      {
        if(foundPost)
        {
          console.log("post found:");
          console.log(foundPost);
          let jsonifiedPost = JSON.parse(JSON.stringify(foundPost));
          jsonifiedPost.title = he.decode(jsonifiedPost.title);
          jsonifiedPost.content = he.decode(jsonifiedPost.content);
          if(jsonifiedPost.image)
            jsonifiedPost.image = he.decode(jsonifiedPost.image);
          
          jsonifiedPost.checkedTags = {};
          //TODO: tags are kind of an afterthought right now and aren't really used for anything. Still, using this method for now, at least until I make the tags properly...
          for(let i = 0; i < jsonifiedPost.tags.length; i++)
            jsonifiedPost.checkedTags[jsonifiedPost.tags[i]] = "checked";

          console.log("jsonified post:");
          console.log(jsonifiedPost);

          //user is owner of this post
          if(jsonifiedPost.author.toString() == req.user._id.toString())
          {
            res.render('edit-post', {
              pageTitle: 'Edit Post',
              user: jsonUser,
              extraCSS: ["create-post"],
              extraJS: ["create-post"],
              post: jsonifiedPost
            });
          }
          else
          {
            res.render('edit-post', {
              pageTitle: 'Edit Post',
              user: jsonUser,
              extraCSS: ["create-post"],
              extraJS: ["create-post"],
              errors: [{msg: "You are not the author of this post!"}]
            });
          }
        }
        else
        {
          res.status(404).send('post not found');
        }
      }
    });
  }
});

postsRouter.post('/:postId/edit', [
  //Validation
  body('title').trim().escape().notEmpty().withMessage("Title cannot be empty"),
  body('content').escape().notEmpty().withMessage("Content cannot be empty"),
  body('image').escape()
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
      res.render('edit-post', {
        pageTitle: "Edit Post",
        user: jsonUser,
        extraCSS: ["create-post"],
        extraJS: ["create-post"],
        errors: errors.array()
      });
    }
    else
    {
      //No validation errors
      console.log("No validation errors, starting to update doc");

      Post.findByIdAndUpdate(req.params.postId, { title: req.body.title, image: req.body.image, content: req.body.content, tags: req.body.tags }, {new: true}, function(err, updatedPost) {
        if(err)
        {
          console.log(err);
          //re-load page with errors
          res.render('edit-post', {
            pageTitle: "Edit Post",
            user: jsonUser,
            extraCSS: ["create-post"],
            extraJS: ["create-post"],
            errors: [err]
          });
        }
        else
        {
          console.log("updated post:");
          console.log(updatedPost);
          res.redirect('/posts/'+req.params.postId);
        }
      });

      //=============

      // Post.create({author: req.user._id, title: req.body.title, content: req.body.content, tags: req.body.tags})
      // .then((msg) => {
      //   console.log("doc created");
      //   //TODO: redirect to newly created post
      //   res.redirect('/posts');
      // }).catch((err) => {
      //   //re-load page with errors
      //   console.log("error creating doc");
      //   console.log(err);
      //   res.render('create-post', {
      //     pageTitle: "Create Post",
      //     user: jsonUser,
      //     extraCSS: ["create-post"],
      //     extraJS: ["create-post"],
      //     errors: [{msg: err}] //not sure if this works
      //   });
      //   //next(err);
      // });
    }

  }
});

postsRouter.post('/:postId/comment', [
  //validate
  body('content').escape().notEmpty().withMessage("Content cannot be empty")
], (req, res, next) => {

  //Validation done
  if(!req.user)
    res.redirect('/users/login'); //if not logged in, re-direct to login
  else
  {
    console.log("Validation done");
    var validationErr = validationResult(req);
    //if there were validation errors...
    if (!validationErr.isEmpty())
    {
      console.log("Validation Errors:");
      console.log(validationErr.array());

      //TODO: Need to figure out how to pass along the errors through the redirect... I suppose the flash thing might be it, but we'll see... 
      res.redirect('/posts/'+req.params.postId);
    }
    else
    {
      //find right post
      Post.findById(req.params.postId, function(findErr, post) {
        if(findErr)
        {
          console.log(findErr);
          //TODO: Need to figure out how to pass along the errors through the redirect... I suppose the flash thing might be it, but we'll see... 
          res.redirect('/posts/'+req.params.postId);
        }
        else
        {
          //add new comment
          post.comments.push({author: req.user._id, content: req.body.content});
          post.save((saveErr, doc) => {
            if(saveErr)
            {
              console.log(saveErr);
              //TODO: Need to figure out how to pass along the errors through the redirect... I suppose the flash thing might be it, but we'll see... 
              res.redirect('/posts/'+req.params.postId);
            }
            else
            {
              //redirect to post page with #comments to focus the page onto the comments section
              res.redirect('/posts/'+req.params.postId+'#comments');
            }
          });
        }
      });
    }
  }
});

postsRouter.post('/:postId/comment/:commentId/delete', function(req, res, next) {
  //!This is meant to be done via AJAX, so responses aren't views

  console.log("comment delete start");
  //Need to be signed in for this action
  if(req.user)
  {
    Post.findById(req.params.postId, function(postFindErr, foundPost) {
      if(postFindErr)
      {
        console.log(postFindErr);
        res.send({error: postFindErr.toString()});
      }
      else
      {
        if(!foundPost || !foundPost.comments.id(req.params.commentId))
        {
          console.log("Comment not found");
          res.send({error: "Comment not found!"});
        }
        else
        {
          console.log("comparing: " + foundPost.comments.id(req.params.commentId).author.toString() + " == " + req.user._id.toString());
          if(foundPost.comments.id(req.params.commentId).author.toString() != req.user._id.toString())
          {
            console.log("You do not own this comment!");
            res.send({error: "You do not own this comment!"});
          }
          else
          {
            foundPost.comments.id(req.params.commentId).remove();
            foundPost.save(function(err, doc) {
              if(err)
              {
                console.log(err);
                res.send({error: err.toString()});
              }
              else
              {
                res.send({success: true});
              }
            });
          }
        }
      }
    });
  }
  else
  {
    res.send({error: 'login'});
  }
});

postsRouter.post('/:postId/comment/:commentId/vote', function(req, res, next) {
  //!This is meant to be done via AJAX, so responses aren't views

  console.log("upvote start");
  //Need to be signed in for this action
  if(req.user)
  {
    let wantedVote = req.body.vote;
    console.log("wantedVote is:" + wantedVote);

    //Make the vote
    Post.findById(req.params.postId, function(postFindErr, postFindResult) {
      if(postFindErr)
      {
        console.log(postFindErr);
        res.send({error: JSON.stringify(postFindErr)});
      }
      else
      {
        console.log("postFindResult:");
        console.log(postFindResult);
        let commentIndex = postFindResult.comments.findIndex((x) => x._id.toString() == req.params.commentId.toString());
        console.log("commentIndex: " + commentIndex);

        let oldVoteIndex = postFindResult.comments[commentIndex].votes.findIndex((x) => x.user.toString() == req.user._id.toString());
        console.log("oldVoteIndex: " + oldVoteIndex);

        let newVoteState = wantedVote;
        //if found old vote...
        if(oldVoteIndex >= 0)
        {
          //...update it
          if(postFindResult.comments[commentIndex].votes[oldVoteIndex].state == wantedVote)
            postFindResult.comments[commentIndex].votes[oldVoteIndex].state = newVoteState = 0; //if upvote/downvote is clicked when said vote is already active, remove it - i.e. neutral vote
          else
            postFindResult.comments[commentIndex].votes[oldVoteIndex].state = wantedVote;
        }
        else
          postFindResult.comments[commentIndex].votes.push({user: req.user._id, state: wantedVote}); //...else make new vote
        
        //count new score
        let newScore = 0;
        for(let i = 0; i < postFindResult.comments[commentIndex].votes.length; i++)
          newScore+= postFindResult.comments[commentIndex].votes[i].state;
        
        //update and save
        postFindResult.comments[commentIndex].points = newScore;
        postFindResult.save();

        res.send({state: newVoteState, score: newScore});
      }
    });
  }
  else
  {
    res.send({error: 'login'});
  }
});

postsRouter.post('/:postId/vote', function(req, res, next) {
  //!This is meant to be done via AJAX, so responses aren't views

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

module.exports = postsRouter;