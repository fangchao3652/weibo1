var mongoose = require('mongoose')

var CommentSchema = new mongoose.Schema({
    articleId: String,//文章编号
    name: String,//评论人
    content: String,//评论内容
    time: Date,//评论时间
    website: String,//评论人的 网址
    email: String

});

/*//为该模式添加一个方法
CommentSchema.pre('save', function (next) {
    if (this.isNew) {
        this.time = Date.now();
    }

    next();
});*/
//静态方法  实例化或model后才能用
CommentSchema.statics = {

    findByArticleId: function (id, callback) {
        return this.findOne({articleId: id}).sort('time').exec(callback)
    }


}

module.exports = CommentSchema;