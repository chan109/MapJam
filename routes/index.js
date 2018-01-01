var express = require('express');
var users = require('../models/users');
var router = express.Router();


/* GET home page. */
router.get('/', ensureAuthenticated,function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', "You are logged out");
    res.redirect('/login');
})

router.get("/test", function (req, res, next) {
    res.render('index');
})

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        console.log(req.user);
        return next();
    }else{
        req.flash('error_msg', 'You are not logged in');
        res.redirect('login');
    }
}

module.exports = router;
