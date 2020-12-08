var express = require('express');
var router = express.Router();

//Register
router.get('/register', function(req, res, next) {
  res.render('register', { pageTitle: 'Register' });
});

//Login
router.get('/login', function(req, res, next) {
  res.render('login', { pageTitle: 'Login' });
});


module.exports = router;
