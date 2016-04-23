var markdown = require('markdown').markdown;

var mongoose = require('mongoose')
var PostSchema = new mongoose.Schema({
    name: String,//作者
    title: String,//题目
    post: String,//内容
    time: {//发表时间
        type: Date,
        default: Date.now()
    },
    comments: Array,
    tags: Array,
    pv: {//pv统计
        type: Number,
        default: 0
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
    /**
     * 根据用户名 查找所有的 posts
     * @param username
     * @param callback
     */
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

    },


    /**
     * 分页  一次获取十篇文章
     * @param username
     * @param page
     * @param callback
     */
    getTen: function (username, page, callback) {
        var query = {};
        if (username) {
            query.name = username;
        }
        this.count(query, function (err, total) {
            this.find(query, function (err, docs) {
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                })
                callback(err, docs, total);
            }).sort({time: -1}).skip((page - 1) * 10).limit(10);
        });


    }


    ,
    /**
     * 根据文章唯一编号查找 一篇文章(因为返回的是markdown 编码后的所以修改文章是查找不用这个)
     * @param id
     * @param callback
     * @returns {Promise}
     */
    getpostById: function (id, callback) {
        return this.findOne({_id: id}, function (err, doc) {
            if (doc) {
                this.update({_id: id}, {$inc: {pv: 1}}, function (err) {
                    if (err)
                        return callback(err);
                });


                doc.post = markdown.toHTML(doc.post);
                callback(err, doc);
            }

        });
    },


    /**
     * 根据文章唯一编号查找 一篇文章然后用于修改
     * @param id
     * @param callback
     * @returns {Promise}
     */
    getpostByIdForEdit: function (id, callback) {
        return this.findOne({_id: id}).exec(callback)
    },
    /**
     * 根据用户名 和 文章名 查找 文章
     * @param username
     * @param title
     * @param callback
     * @returns {Promise}
     */
    getpostsByNameTitle: function (username, title, callback) {
        this.findOne({name: username, title: title}, function (err, doc) {
            if (doc) {
                doc.post = markdown.toHTML(doc.post);
                callback(err, doc);
            }

        });

    },
    /**
     * 根据_id 更新
     * @param id
     * @param callback
     */
    updateArticle: function (id, setstr, callback) {
        var condition = {_id: id};
        var update = {$set: setstr};
        var options = {upsert: true};
        return this.update(condition, update, options, callback);
    },
    /**
     * 删除文章
     * @param id
     * @param callback
     * @returns {Promise|Query|*}
     */
    removeArticle: function (id, callback) {
        var conditions = {_id: id};
        return this.remove(conditions, callback);
    },
    /**
     * 获取所有的标签
     * @param callback
     * @returns {Promise}
     */
    getTags: function (callback) {
        return this.distinct("tags").exec(callback)
    },
    /**
     * 获取某一个标签下的文章
     * 查询所有 tags数组内包含tag的文档
     * 并返回只含有name  time title 组成的数组
     * @param tag
     * @param callback
     */
    getTag: function (tag, callback) {
        return this.find({tags: tag}, {name: 1, title: 1, time: 1}).exec(callback)   //1 代表显示该字段  0代表显示除此字段外的字段，若有0就不能有1
    }

    ,
    /**
     * 根据 关键字search文章  支持 正则表达式
     * @param keyword
     * @param callback
     * @returns {Promise}
     */
    search: function (keyword, callback) {
        var pattern = new RegExp("^.*" + keyword + ".*$", "i");
        return this.find({title: pattern}, {name: 1, title: 1, time: 1}).sort({time: -1}).exec(callback)
    }

}

module.exports = PostSchema;