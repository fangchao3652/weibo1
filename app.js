var express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var routes = require('./routes/index');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/weibo');
var dbsetting = require('./setting.js')
var app = express();

app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {
    layout: true
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: dbsetting.cookieSecret,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        //db:"weibo"
        url: dbsetting.url
    })
}));
app.use(flash());
/**
 * 自定义中间件 要放在路由规则之前(每一次路有前都会经过这里)
 */
app.use(function (  req, res, next) {

    console.log("app.usr local==="+req.method+"==="+req.url);
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;
    var error = req.flash('error');
    res.locals.error = error.length ? error : null;

    var success = req.flash('success');
    res.locals.success = success.length ? success : null;
    next();

});


app.use('/', routes);



/*
 app.get('/', routes.index);
 app.get('/u/:user', routes.user);
 app.post('/post', routes.post);
 app.get('/reg', routes.reg);
 app.post('/reg', routes.doReg);
 app.get('/login', routes.login);
 app.post('/login', routes.doLogin);
 app.get('/logout', routes.logout);*/
/*
app.dynamicHelpers({
    user: function(req, res) {
        return req.session.user;
    },
    error: function(req, res) {
        var err = req.flash('error');
        if (err.length)
            return err;
        else
            return null;
    },
    success: function(req, res) {
        var succ = req.flash('success');
        if (succ.length)
            return succ;
        else
            return null;
    }
});
*/

app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
module.exports = app;
