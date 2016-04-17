var mongoose = require('mongoose')
var PostSchema = require('../schemas/postchemas.js');

var Post = mongoose.model('post', PostSchema);//
module.exports = Post;