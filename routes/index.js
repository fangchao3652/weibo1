 var express = require('express');
 var crypto=require('crypto');
 var router = express.Router();
var  User=require('../models/user.js')
 var Post=require('../models/post.js')
 router.get('/', function(req, res, next) {
     Post.getpost(null, function(err, posts) {

         if (err) {
             req.flash('error', err);
             return res.redirect('/');
         }
         res.render('index', {
             title:'首页',
             posts: posts
         });
     });




 });
 //注册 显示form
 router.get('/reg', checkNotLogin);
 router.get('/reg', function(req, res, next) {
   res.render('reg', { title: '用户注册' });
 });
 //注册  提交form的信息
 router.post('/reg', checkNotLogin);
 router.post('/reg', function(req, res, next) {
     //检验用户两次输入的口令是否一致
     if (req.body['password-repeat'] != req.body['password']) {
         req.flash('error', '两次输入的口令不一致');
         return res.redirect('/reg');}
     //生成口令的散列值
     var md5 = crypto.createHash('md5');
     var password = md5.update(req.body.password).digest('base64');

     var newUser=new User({
         name:req.body.username,
         password:password
     });
     //检测用户是否存在
     User.findByName(newUser.name,function(err,user){

         if (user)
             err = '该用户已经存在';
         if (err) {
             req.flash('error', err);
             return res.redirect('/reg');
         }


         //如果不存在则新增用户
         newUser.save(function(err) {
             if (err) {
                 req.flash('error', err);
                 return res.redirect('/reg');
             }
             req.session.user = newUser;//接着登陆
             req.flash('success', '注册成功');
             res.redirect('/');
         });
     });
 });

//登陆
 router.get('/login', checkNotLogin);
 router.get('/login', function(req, res) {
     res.render('login', {
         title: '用户登入'
     });
 });

 router.post('/login', checkNotLogin);
 router.post('/login', function(req, res) {
//生成口令的散列值
     var md5 = crypto.createHash('md5');
     var password = md5.update(req.body.password).digest('base64');
     User.findByName(req.body.username, function(err, user) {
         if (!user) {
             req.flash('error', '用户不存在');
             return res.redirect('/login');
         }
         if (user.password != password) {
             req.flash('error', '用户口令错误');
             return res.redirect('/login');
         }
         req.session.user = user;
         req.flash('success', '登入成功');
         res.redirect('/');
     });
 });

 router.get('/logout', checkLogin);
 router.get('/logout', function(req, res) {
     req.session.user = null;
     req.flash('success', '登出成功');
     res.redirect('/');
 });
 router.post('/post', checkLogin);
 router.post('/post', function(req, res) {
     var currentUser = req.session.user;
     var post = new Post({
         name:currentUser.name,
         post:req.body.post
     } );
     post.save(function(err) {
         if (err) {
             req.flash('error', err);
             return res.redirect('/');
         }
         req.flash('success', '发表成功');
         res.redirect('/u/' + currentUser.name);
     });
 });

 router.get('/u/:user', function(req, res) {
     User.findByName(req.params.user, function(err, user) {
         if (!user) {
             req.flash('error', '用户不存在');
             return res.redirect('/');
         }
         Post.getpost(user.name, function(err, posts) {

             console.log("posts==index.js==>"+posts)
             if (err) {
                 req.flash('error', err);
                 return res.redirect('/');
             }
             res.render('user', {
                 title: user.name,
                 posts: posts
             });
         });
     });
 });




 /**
  * 权限控制
  * @param req
  * @param res
  * @param next
  */
 function checkLogin(req, res, next) {
     if (!req.session.user) {
         req.flash('error', '未登入');
         return res.redirect('/login');
     }
     next();
 }
 function checkNotLogin(req, res, next) {
     if (req.session.user) {
         req.flash('error', '已登入');
         return res.redirect('/');
     }
     next();
 }

 module.exports = router;
