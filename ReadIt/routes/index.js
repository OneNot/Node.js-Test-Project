var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  let jsonUser = null;
  if(req.user)
  {
    jsonUser = {
      username: req.user.username,
      displayName: req.user.displayName
    };
  }
  res.render('posts', { pageTitle: 'Posts', user: jsonUser});
});

module.exports = router;
