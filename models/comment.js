var mongoose = require('mongoose')
var CommentSchema = require('../schemas/commentschemas.js');

var Comment = mongoose.model('comment', CommentSchema);//show collectios   就是Comments  自动加个s
module.exports = Comment;