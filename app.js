var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session')

//引入connect-mongo包
var  MongoStore  = require("connect-mongo")(session);

//1.引进socket.io包
var io=require('socket.io')();
//裁入connect-flash  这个需要在session之后加入
var flash=require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var lessonRouter = require('./routes/lesson')(io);


var app = express();
//2在express后,将io对象赋值给 app.io
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('html',require('ejs').__express);
app.set('view engine', 'html');

app.use(flash());

//session保存设置
/*
{"cookie":{
"originalMaxAge":1800000,
"expires":"2020-02-20T06:45:33.278Z",
"httpOnly":true,"path":"/"},
"flash":{}
}
 */
app.use(session({
  secret: 'suijizifuchuan',   // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
  name:'session_id',/*保存在本地cookie的一个名字 默认connect.sid  可以不设置*/
  resave: false,   /*强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。*/
  saveUninitialized: true,   //强制将未初始化的 session 存储。  默认值是true  建议设置成true
  cookie: {
    maxAge:1000*3600*12    /*过期时间*/

  },   /* secure:true  https这样的情况才可以访问cookie */
  rolling:true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
  store:new MongoStore({
    url: 'mongodb://127.0.0.1:27017/videos',  //数据库的地址  videos是数据库名
    touchAfter: 24 * 3600   // 通过这样做，设置touchAfter:24 * 3600，您在24小时内只更新一次会话，不管有多少请求(除了在会话数据上更改某些内容的除外)
  })
}));
// app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 6000000 }}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//默认的静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

//res.locals结合路由守卫，传递数据状态
//这样登录全局有登入状态，res.locals.isLogin在给值的时候直接写 如：<%if( isLogin ){}%> 非<%if(res.locals.isLogin){}%>
app.use(function (req,res,next) {
  //所在路由下有效
  res.locals.isLogin = req.session.isLogin;
  res.locals.message=req.flash('message').toString();
  res.locals.infotype=req.flash('infotype').toString();

  next();
});
//后台模块路由守卫
app.use('/admin',function(req,res,next){
  //不是用户要求登录 ，登录了role小于4也不能进admin
  if(!req.session.user || req.session.user.role < 4){
    req.flash("infotype","warning");
    req.flash("message","只有管理员可以登录后台");
    res.redirect("/users/login")
  }else{
    next();
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',adminRouter);
app.use('/lesson',lessonRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
