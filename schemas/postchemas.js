var markdown = require('markdown').markdown;

var mongoose = require('mongoose')
var PostSchema = new mongoose.Schema({
    name: String,//作者
    title: String,//题目
    post: String,//内容
    time: {//发表时间
        type: Date,
        default: Date.now()
    }
});
/**
 * 如没有这个 存储前的预处理  存储时间就会一直是 数据库第一次打开时的时间，不是服务器启动的时间
 */
PostSchema.pre('save', function (next) {
    if (this.isNew) {
        this.time = Date.now();
    }

    next();
});

PostSchema.statics = {
    getpost: function (username, callback) {
        var query = {};
        if (username) {
            query.name = username;
        }


        this.find(query, function (err, docs) {
            docs.forEach(function (doc) {
                doc.post = markdown.toHTML(doc.post);
            })
            callback(err, docs);
        }).sort({time: -1});

    }
}

module.exports = PostSchema;