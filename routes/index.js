var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var User = require('../models/user.js')
var Post = require('../models/post.js')
var Comment = require('../models/comment.js')


router.get('/', function (req, res, next) {
    Post.getpost(null, function (err, posts) {

        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('index', {
            title: '首页',
            posts: posts
        });
    });


});
//注册 显示form
router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res, next) {
    res.render('reg', {title: '用户注册'});
});
//注册  提交form的信息
router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res, next) {
    //检验用户两次输入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', '两次输入的口令不一致');
        return res.redirect('/reg');
    }
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
        name: req.body.username,
        password: password,
        email: req.body.email
    });
    //检测用户是否存在
    User.findByName(newUser.name, function (err, user) {

        if (user)
            err = '该用户已经存在';
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }


        //如果不存在则新增用户
        newUser.save(function (err) {
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
router.get('/login', function (req, res) {
    res.render('login', {
        title: '用户登入'
    });
});

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
//生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.findByName(req.body.username, function (err, user) {
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
router.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});


router.get('/post', checkLogin);
router.get('/post', function (req, res) {
    res.render('post', {title: '发表'})
});


router.post('/post', checkLogin);
router.post('/post', function (req, res) {
    var currentUser = req.session.user;
    var post = new Post({
        name: currentUser.name,
        title: req.body.title,
        post: req.body.post
    });
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发表成功');
        res.redirect('/u/' + currentUser.name);
    });
});

router.get('/u/:user', function (req, res) {
    User.findByName(req.params.user, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        Post.getpost(user.name, function (err, posts) {

            console.log("posts==index.js==>" + posts)
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
 * 查看文章详情
 */
router.get('/article/:id', function (req, res) {
    Post.getpostById(req.params.id, function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('article', {
            title: post.title,
            post: post

        })
    });
});
/**
 * 编辑文章
 */
router.get('/edit/:id', checkLogin);
router.get('/edit/:id', function (req, res) {
    Post.getpostByIdForEdit(req.params.id, function (err, doc) {
        if (err) {
            req.flash("error", err);
            return res.redirect('back');//相当于不跳转
        }
        res.render('edit', {
            title: '文章编辑',
            post: doc

        });
    })
});
/**
 * 编辑修改后 form提交action
 */
router.post('/edit/:id', checkLogin);
router.post('/edit/:id', function (req, res) {
    var newTitle = req.body.title;
    var newPost = req.body.post;
    var setstr = {title: newTitle, post: newPost};
    Post.updateArticle(req.params.id, setstr, function (err) {
        if (err) {
            req.flash("error", err)
            return res.redirect('/article/' + req.params.id)
        }
        req.flash("success", '修改成功')
        return res.redirect('/article/' + req.params.id)
    });

});

/**
 * 删除  删除完直接跳到首页 不用动态的用ajax删除，因为这个删除链接目前在文章详情里 删除后 这个页面就没了
 * 当有管理页面，列表形式管理的时候要用ajax 然后动态删除该元素（参考删除电影  imooc_movie）
 */
router.get('/remove/:id', checkLogin)
router.get('/remove/:id', function (req, res) {
    Post.removeArticle(req.params.id, function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '删除成功');
        res.redirect('/');
    });
});
/**
 * 留言
 */
router.post('/article/:id', function (req, res) {
    var date = new Date();
    var articleId = req.params.id;
    var newcommnent = new Comment({
        articleId: articleId,
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        content: req.body.content,
        time: date
    });


    newcommnent.save(function (err, doc) {

        console.log('==========doc========' + doc)
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
//更新 文章  留言字段
        var condition = {_id: articleId};
        var update = {$push: {comments: doc}};

        Post.update(condition, update, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功');
            res.redirect('back');
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
