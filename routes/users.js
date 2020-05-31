var express = require('express');
var router = express.Router();
var User = require("../models/User");
var multer = require("multer");
var upload = multer({ dest: 'public/uploads/headpic',limits:{filesize:1024*1024*1024*5} });
var path = require("path");
var fs = require("fs");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {

  res.render("user/login",{});
});
//提交登录信息：用户名和密码
router.post('/login', function(req, res, next) {
  let username=req.body.username;
  let userpwd=req.body.userpwd;

  User.findOne({username:username,userpwd:userpwd}).then(result=>{
    if (result){
      req.session.user = result;
      req.session.isLogin = true;
      res.redirect("/users/userinfo")
    }else{
      res.back();
    }
  })

});

//用户注册界面
router.get('/register', function(req, res, next) {
    // var data = {};
    // if(req.session.error){
    //     data.error = req.session.error;
    // }
    res.render("user/register",{})
});

router.post("/register",async function (req,res,next) {
  var username = req.body.username;
  var userpwd = req.body.userpwd;
  var email = req.body.email;
// console.log(username,email,userpwd)
    //or的用法(???)
    await User.find({$or:[{username: username,email: email}]}).then(result=>{
        if(result){
            req.session.error = {
                message: "用户名已经被注册"
            }
            res.redirect("back");
        }
    })
  //create
  await User.create({username:username,userpwd:userpwd,email:email,role:1,create_at:Date.now(),update_at:Date.now()})
      .then(result=>{
        if(result){
          req.session.user = result;
          req.session.isLogin=true;
          res.redirect("/users/userinfo");
        }else{
            res.redirect("back")
        }
      });

});

router.get('/userinfo', function(req, res, next) {
      if(req.session.isLogin){
        next();
      }else{
        res.redirect("/users/login")
      }
    },function(req, res, next) {
      res.render("user/userinfo",{user:req.session.user,isLogin:req.session.isLogin});
    });
//修改信息
router.post('/userinfo',upload.single('headpic'),function(req, res, next) {
  var userid = req.session.user._id;
  var email=req.body.email;
  var role=req.body.role;
  // console.log(userid,email,role)

  //要判断用户是否要修改图片，如果不修改，数据里面字段就不需要更新

   //获取后缀名
   var extName = path.extname(req.file.originalname);
   /*
   * var allowext = ['.png','.jpeg','.jpg','.gif','.webp','.avi','.mp4','.mp3',',mpeg'];
   *
   * */
   //文件名 qewqafdasdfasdf.jpg
   var fName = req.file.filename+extName;

   //  public/uploads/headpic/qewerwr.jpg
   var newName = req.file.path+extName;
  //  //判断，newname是否
   fs.rename(req.file.path,newName,function (err) {
       if(!err){
           User.updateOne({_id:userid},{$set:{email:email,role:role,headpic:fName}}).then(result=>{

               if(result.n>0){
                   req.session.user.email=email;
                   req.session.user.role = role;
                   req.session.user.headpic = fName;
                   res.redirect("/users/userinfo")
               }
           })
       }else{
           res.back();
       }
   });
});
//退出
router.get("/logout",function (req,res,next) {
    if(req.session){
        req.session.destroy();
        res.redirect("/");
    }
});

module.exports = router;
