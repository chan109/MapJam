var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

var Util = new(require('../utils/util'));

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

var User = require('../models/users');

passport.use(new LocalStrategy(
    function(username, password, done) {

        User.getUserByUsername(username, function (err, user) {
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unkown User'});
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user, {message: 'Login Successfully'});
                }else{
                    return done(null, false, {message: 'Invalid password'});
                }
            })
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
})

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    })
})

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.find({}, function (err, docs) {
        if(!err){
            res.send(docs);
        }
        else{
            throw err;
        }
    })
});


//endpoint to handle signup
router.post("/register", function (req, res, next) {
    var name = req.body.username;
    var gender = req.body.gender;
    var password = req.body.password;
    var password2 = req.body.password2;
    var email = req.body.email;
    var age = req.body.age;
    var location = req.body.location;
    var phoneNum = req.body.phoneNumber;
    var selfDes = req.body.selfDescription;
    var userImage = req.body.userImg;
    var videoLinks = req.body.videoLinks.split(",").map((item) => item.trim()).filter((item) => item != "");
    var instruments = req.body.instruments.split(",").map((item) => item.trim()).filter((item) => item != "");

    // validation
    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', "Email is not valid").isEmail();

    var errors = req.validationErrors();

    if(errors){
        res.render("register", {
            errors: errors
        });
    }else{
        var newUser = new User({
            name: name,
            email: email,
            password: password,
            gender: gender,
            age: age,
            location: location,
            phoneNumber: phoneNum,
            selfDescription: selfDes,
            imageUrl: userImage,
            instruments: instruments,
            videoLinks: videoLinks
        });
        User.createUser(newUser, function (err, user) {
            if(err) throw err;
        });

        req.flash('success_msg', "You are registered and can now login");

        res.redirect("/")
    }
});

//endpoint to handle login
router.post('/login',
    passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: true, successFlash: "welcome"}),
    function(req, res) {
        res.redirect("/");
    });

//Given user's id and its location to update
//update the location of the user
router.post("/geo/:id", function (req, res,next) {

    var tempPromise = Util.validateLocation(req.body.location);
    tempPromise.then(function (isValid) {
        User.findOneAndUpdate({"_id": ObjectId(req.params.id)}, { $set: {location: req.body.location}}, function (err, doc) {
            if(err) throw err;
            res.json(doc)
        })
    })
    .catch(function (err) {
        res.status(400).send({message: "location is not valid"});
    })

})

//Retrived the user's information
router.get("/:id", function (req, res, next) {

    //can be refactored
    User.findById(req.params.id, function (err, docs) {
        if(err){
            res.status(400).send({message: "objectId is not valid"})
        }
        if(!docs)
        {
            res.status(404).send({message: "object is not found"})
        }
        res.send(docs);
    })
})

//Update the user's personal information
router.post("/:id", function (req, res, next) {

    //need to add logic to check for each fields

    User.findOneAndUpdate({"_id": ObjectId(req.params.id)}, { $set: req.body}, function (err, doc) {
        if(err){
            console.log(err);
            res.status(400).send({message: "objectId is not valid"})
        }
        else if(!doc)
        {
            res.status(404).send({message: "object is not found"})
        }else{
            console.log("Successfully update")
            res.json(doc)
        }
    })
})

//remove user
router.delete("/:id", function (req, res, next) {
    //validate the object id first
    User.findById(req.params.id, function (err, doc) {
        if(err){
            res.status(400).send({message: "objectId is not valid"})
        }
        if(!doc)
        {
            res.status(404).send({message: "object is not found"})
        }
    })

    //now start removing the object
    User.deleteOne({"_id": req.params.id}, function (err, doc) {
        if(err) {
            res.status(400).send({message: 'delete unsuccessfully'})
        }else{
            res.status(200).send({message: 'delete successfully'});
        }
    })
})

//retrieve video links of a user by user's id
router.get("/videos/:id", function (req, res, next) {
    //validate the object id first
    User.validateObjectId(req.params.id, function (data) {
        if(data.code != 200){
            res.status(data.code).send({message: data.message})
        }else{
            User.findById(req.params.id, function (err, doc) {
                res.json({"videoLinks":doc.videoLinks})
            })
        }
    });

})
module.exports = router;
