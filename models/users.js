//Require Mongoose
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//Define a schema
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    name: String,
    location: String,
    age: Number,
    gender: String,
    imageUrl: String,
    instruments: {type: [String]},
    email: {type: String, required: true},
    selfDescription: String,
    phoneNumber: String,
    // message: {type: [String]},
    videoLinks: {type:[String]},
    password: {type: String, required: true}
});

const Users = mongoose.model('users', UsersSchema);

module.exports = Users;

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function (username, callback) {
    var query = {name: username};
    Users.findOne(query, callback);
}

module.exports.comparePassword = function (candiatePassword, hash, callback) {
    // Load hash from your password DB.
    bcrypt.compare(candiatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};

module.exports.validateObjectId = function (id, callback) {
    Users.findById(id, function (err, doc) {
        if(err){
            callback({code: 400, message: "objectId is not valid"})
        }
        else if(!doc)
        {
            callback({code: 404, message: "objectId is not found"})
        }else{
            callback({code: 200, message: "object is found"})

        }
    })
}

module.exports.getUserById = function (id, callback) {
    Users.findById(id, callback);
}