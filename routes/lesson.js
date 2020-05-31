var express = require('express');
var Category = require("../models/Category");
var User = require("../models/User");
var Course = require("../models/Course");
var Chapter = require("../models/Chapter");
var Section = require("../models/Section");
var Video = require("../models/Video");
var Lesson = require("../models/Lesson");
var router = express.Router();

var lesson = function(io) {
/* GET home page. */
router.get('/', async function(req, res, next) {
    var data = {
        category:[],
        course:[],
        topCourse:[]
    };
    await Category.find().sort("orderno").then(result=>{
        if(result){
            data.category = result;
        }
    });
    await Course.find().populate("teacher").then(result=>{
        if(result){
            data.course = result;
        }
    });
    await Course.find().populate("publisher",'username headpic').limit(5).then(result=>{
        if(result){
            data.topCourse = result;
        }
    });
    // console.log(data.topCourse);
  res.render('course/list',{data:data});
});

//获取指定分类下的数据
router.get('/category/:id', async function(req, res, next) {
    var id = req.params.id;
    var data = {
        category:[],
        course:[],
        topCourse:[]
    };
    await Category.find().sort("orderno").then(result=>{
        if(result){
            data.category = result;
        }
    });
    await Course.find({category:id}).populate("teacher").then(result=>{
        if(result){
            data.course = result;
        }
    });
    await Course.find().populate("publisher",'username headpic').limit(5).then(result=>{
        if(result){
            data.topCourse = result;
        }
    });
    res.render('course/categorylist',{data:data});
});

router.get('/show/:id', async function(req, res, next) {
    var id=req.params.id;
    var data = {
        category:[],
        course:[],
        topCourse:[]
    };
    await Category.find().then(result=>{
        if(result){
            data.category = result;
        }
    });
    await Course.findOne({_id:id}).populate("teacher").then(result=>{
        if(result){
            data.course = result;
        }
    });
    await Course.find().sort("-learners").limit(5).then(result=>{
        if(result){
            data.topCourse = result;
        }
    });
    res.locals.title = "我自定义的标题";

    res.render('course/show',{data:data});
});

/*
* function(req,res,next){
    if(req.session.isLogin){
        next()
    }else{
        res.redirect("/users/login");
    }

}
* */
//获取章数据
// router.get("/learn/:id",async function(req,res,next){
//
//     let id = req.params.id;
//
//
//
    //聚合查询，未成功
    /*Chapter.aggregate([{
        $match:{
            course:req.params.id
        }
    },{
        $lookup: {
            from: 'sections',  // 从哪个Schema中查询（一般需要复数，除非声明Schema的时候专门有处理）
            localField: '_id',  // 本地关联的字段
            foreignField: 'chapter', // user中用的关联字段
            as: 'section'// 查询到所有user后放入的字段名，这个是自定义的，是个数组类型。
        }
    }],function (err,result) {
        console.log(err,result);
    });*/
    //你要查出课程的章


    //查出课程节
    //查出来课程的视频
// });
router.get("/learn/:id",async function(req,res,next) {
    var id=req.params.id;
    //1,监听连接
    io.on("connection",function (socket) {
        //2，监听客户端发送的信息
        socket.on(id,function(msg){
            //3,将客户端的新，再推送给该频道的所有人
            socket.emit(id,msg)
        }) ;
    });
    await  Chapter.find({course:id},function (err,result) {
        if (!err && result){
            res.render("course/learn",{data:result})
            // console.log(result)
        }
    })

})
router.get("/getsection",function(req,res,next){

    Section.find({chapter:req.query.id})
        .then(result=>{
            if(result){
                res.json(result);
            }
        })
});

//获取视频
router.get("/getvideo",function(req,res,next){

    Video.find({section:req.query.id})
        .then(result=>{
            if(result){
                res.json(result);
            }
        })
});

//未用
router.get("/category",function (req,res) {
    Category.find().then(result=>{
    });
  res.render('category', { title: '数据结果' });
});

return router;

}

module.exports = lesson;
