var express = require('express');
var users = require('../models/users');
var router = express.Router();

//get all the chat message
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

//send the message with the id of the target
router.post('/:id', function (req, res, next) {

})

//clear the msg box with options
router.delete('/', function (req, res, nexty) {

})

module.exports = router;
