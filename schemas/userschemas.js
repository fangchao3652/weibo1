var mongoose = require('mongoose')
var UserSchema = new mongoose.Schema({

    name: String,
    password: String,       //等同于 title: {type : String},
    regtime: {   //注册时间
        createAt: {
            type: Date,
            default: Date.now()//
        }
    },
    email: String

});

//为该模式添加一个方法
UserSchema.pre('save', function (next) {
    if (this.isNew) {
        this.regtime.createAt = Date.now();
    }

    next();
});
//静态方法  实例化或model后才能用
UserSchema.statics = {
    fetch: function (callback) {
        return this.find({}).sort('regtime.createAt').exec(callback)
    },
    findById: function (id, callback) {
        return this.findOne({_id: id}).sort('regtime.createAt').exec(callback)
    },
    findByName: function (name, callback) {
        return this.findOne({name: name}).sort('regtime.createAt').exec(callback)
    }
}

module.exports = UserSchema;