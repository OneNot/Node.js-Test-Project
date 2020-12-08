var express = require('express');
var router = express.Router();

//validator
const { body, validationResult } = require('express-validator');


//Register
router.get('/register', function(req, res, next) {
  res.render('register', { pageTitle: 'Register' });
});

router.post('/register', [
  body("email").trim().notEmpty().withMessage("Email cannot be empty")
  .normalizeEmail().isEmail().withMessage("Invalid email"),

  body("username").trim().isLength({min: 4, max: 30}).withMessage("Username must be between 4 and 30 characters long")
  .matches('^[A-Z|a-z|0-9|_]+$').withMessage("Username can only contain characters a-z, 0-9 and _"), //only allowing a-z, 0-9 and _ for now //TODO: allow äö etc.
  
  body("password").isLength({min: 5}).withMessage("Password must be at least 5 characters long")
  .contains(),
  body('password2').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
  {
    console.log(errors.array());

    res.render('register', {
      pageTitle: 'Register',
      errors: errors.array()
    });
  }
  else
  {
    console.log("Valid fields received from Register");
    
  }
});


//Login
router.get('/login', function(req, res, next) {
  res.render('login', { pageTitle: 'Login' });
});


module.exports = router;
