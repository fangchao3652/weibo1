var mongoose = require('mongoose')
var UserSchema = require('../schemas/userschemas.js');

var User = mongoose.model('User', UserSchema);//show collectios   就是Users  自动加个s
module.exports = User;