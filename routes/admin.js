var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Subcat = require('../models/Subcat');
var User = require('../models/User');
var Course = require('../models/Course');
//章
var Chapter = require('../models/Chapter');
//节
var Section = require('../models/Section');
//视频
var Video = require('../models/Video');
/* GET home page. */

var multer = require("multer");
var upload = multer({ dest: 'public/uploads/course',limits:{filesize:1024*1024*1024*5} });
var uploadvideo = multer({ dest: 'public/uploads/video',limits:{filesize:1024*1024*1024*5} });

var path = require("path");
var fs = require("fs");

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


router.get("/category",function (req,res,next) {
    Subcat.find().populate("category").sort('orderno')
        .then(result=>{
            // console.log(result);
            res.render("admin/category/list",{data:result})
        })

})
//添加页面
router.get('/category/add',function (req,res,next) {
    res.render('admin/category/add');
})

//将提交的category数据添加到数据库
router.post("/category",function (req,res,next) {
    var name = req.body.name;
    var orderno = req.body.orderno;
    Category.create({name:name,orderno:orderno}).then(result=>{
        if(result){
            // flash("info","添加成功") 一次性信息
            req.flash('infotype','success');
            req.flash('message','成功添加一级分类:'+name)
            res.redirect("/admin/category")
        }
    })
});

//添加子类，先查所属父类
router.get("/subcat/add",function (req,res,next) {

    Category.find().then(result=>{
        if(result){
            res.render("admin/subcat/add",{data:result});
        }
    });

});
router.post("/subcat",function(req,res,next){
    var name=req.body.name;
    var category = req.body.category;
    var orderno = req.body.orderno;

    Subcat.create({name:name,category:category,orderno:orderno}).then(result=>{
        if(result){
            req.flash('infotype','success');
            req.flash('message','成功添加二级分类:'+name)
            res.redirect("/admin/category")
        }else{
            res.back();
        }
    })
})

//课程操作
//显示所有课程
router.get("/course",function (req,res,next) {
    Course.find().then(result=>{
        if(result){
            var data=result;
            res.render("admin/course/list",{data:data});
        }else{
            req.flash("infotype","warning");
            req.flash("message","数据库还没有课程信息，请通知管理员添加");
            res.redirect("/course/add");
        }
    })
});



//添加课程页面(增)
router.get("/courses/add",async function (req,res,next) {
    var data={
        teacher:[],
        category:[],
        publisher:[]
    };
    //讲师信息
    await User.find({role:5}).then(result=>{
        if(result){
            data.teacher = result;
        }
    });
    await User.find({role:3}).then(result=>{
        if(result){
            data.publisher = result;
        }
    });
    //一级分类信息
    await Category.find().sort("orderno").then(result=>{
        if(result) {
            data.category = result;
        }
    })
    res.render("admin/course/add",{data:data});
});



//根据一级分类的_id，获取它下面的二级分类数据
router.get("/subcat/bycid",function (req,res,next) {
    //根据选择下拉框中的一级分类，得到一级分类的_id
    var catid = req.query.categoryid;
    Subcat.find({category:catid}).sort("orderno")
        .then(result=>{

            //将数据以json的方式输出给前台页面
            res.json(result);
        })
});
//提交添加课程信息 增
router.post("/course",upload.single('thumbnail'),function (req,res,next) {
    var name = req.body.name;
    var category = req.body.subcat;
    var teacher = req.body.teacher;
    var publisher = req.body.publisher;
    // console.log(name,category,teacher,publisher);

    //获取后缀名
    var extName = path.extname(req.file.originalname);
    /*
    * var allowext = ['.png','.jpeg','.jpg','.gif','.webp','.avi','.mp4','.mp3',',mpeg'];
    *
    * */
    //文件名 qewqafdasdfasdf.jpg
    var fName = req.file.filename+extName;

    //  public/uploads/course/qewerwr.jpg
    var newName = req.file.path+extName;


    //判断，newname是否
    fs.rename(req.file.path,newName, function (err) {
        if(err){
            req.flash("message","文件上传失败");
            req.flash("infotype","danger");
            res.redirect("/admin/course/add");
        }else{
           Course.create({name:name,category:category,publisher:publisher,teacher:teacher,thumbnail:fName}).then(result=>{
                    req.flash("message","课程信息保存成功");
                    req.flash("infotype","success");

                    res.redirect("/admin/course");
                })
        }
    });
})
//课程详情
router.get("/course/:id",function (req,res,next) {
    var id = req.params.id;
    Course.findOne({_id:id}).populate("category","name").populate("teacher",["username","headpic"]).populate("publisher",["username","headpic"])
        .exec(function (err,result) {
            res.render("admin/course/show",{course:result});
        });

});

//chapter路由  （admin/sections/add）添加节页面传来course的id
router.get("/chapter",function (req,res,next) {
    var id = req.query.id;
    Chapter.find({course:id}).then(result=>{
        if(result){
            res.json(result)
        }else{
            res.json({});
        }
    })
});

//根据id获取节  查看节内容
router.get("/section/:id",function (req,res,next) {
    var id = req.params.id;
//根据传来的节的id来查询节的内容，因为关联章所以也可以查章内容，这也是关联模型的优点所在
    Section.find({chapter:id}).populate("chapter").exec(function(err,result){

        res.render("admin/section/show",{data:result});
    })
});
//章管理
router.get("/chapter/list",function(req,res,next){
    Chapter.find().populate("course").then(result=>{
        if(result){
            res.render("admin/chapter/list",{data:result})
        }else{
            req.flash("infotype","warning");
            req.flash("message","数据库还没有章节信息，请通知管理员添加");
            res.redirect("/chapter/add");
        }
    })
});
//加载添加页面
router.get("/chapter/add",function (req,res,next) {
    Course.find().then(result=>{
        if(result){
            res.render("admin/chapter/add",{data:result});
        }
    })

});
//添加章数据操作
router.post("/chapter/add",function (req,res,next) {
    var name = req.body.name;
    //所属课程id
    var course = req.body.course;
    var content = req.body.content;
    var orderno = req.body.orderno;

    Chapter.create({name:name,course:course,content:content,orderno:orderno})
        .then(result=>{
            if(result){
                req.flash("infotype","success");
                req.flash("message","添加章数据成功");
                res.redirect("/admin/course");
            }
        })
});
//section 节路由 节管理
router.get("/section",function(req,res,next){
    Section.find().populate("chapter").then(result=>{
        if(result){
            // console.log(result)
            res.render("admin/section/list",{data:result})
        }else{
            req.flash("infotype","warning");
            req.flash("message","数据库还没有章节信息，请通知管理员添加");
            res.redirect("/section/add");
        }
    })
});
//加载添加小节的页面
router.get("/sections/add",function (req,res,next) {
    Course.find().then(result=>{
        if(result){
            res.render("admin/section/add",{data:result});
        }
    })
});

//保存节数据
router.post("/section/add",function (req,res,next) {
    var name = req.body.name;
    var chapter = req.body.chapter;
    var content = req.body.content;
    var orderno = req.body.orderno;

    Section.create({name:name,chapter:chapter,content:content,orderno:orderno}).then(result=>{

        req.flash("infotype","success");
        req.flash("message","添加节数据成功");
        res.redirect('/admin/sections');
    })
});
//视频：路由
//显示所有视频列表
router.get("/videos",function (req,res,next) {
    Video.find().populate("section")
        .then(result=>{
            if(result){
                res.render("admin/video/list",{data:result});
            }
        })
});

router.get("/videos/add",function (req,res,next) {
    Section.find().then(result=>{
        if(result){
            res.render("admin/video/add",{data:result});
        }
    })
});
router.post("/videos/add",uploadvideo.single('poster'),function (req,res,next) {
    var name = req.body.videoname;
    var source = req.body.source;
    var section = req.body.section;
    // var poster = '4f8c1ada58b4662f8e801f7751789db3.png';
    var orderno = req.body.orderno;


//获取后缀名
    var extName = path.extname(req.file.originalname);
    /*
    * var allowext = ['.png','.jpeg','.jpg','.gif','.webp','.avi','.mp4','.mp3',',mpeg'];
    *
    * */
    //文件名 qewqafdasdfasdf.jpg
    var fName = req.file.filename+extName;

    //  public/uploads/course/qewerwr.jpg
    var newName = req.file.path+extName;
// console.log(name,source,section,orderno,fName);
    //判断，newname是否
    fs.rename(req.file.path,newName, function (err) {
        if(err){
            req.flash("message","文件上传失败");
            req.flash("infotype","danger");
            res.redirect("/admin/videos/add");
        }else{
            Video.create({name:name,source:source,poster:fName,section:section,orderno:orderno})
                .then(result=>{
                    if(result){
                        req.flash("infotype","success");
                        req.flash("message","添加视频数据成功");
                        res.redirect("/admin/videos")
                    }
                })
        }
    });

});

router.get("/echarts",async function (req,res) {
    var data={
        category:[],
        category_id:[],
        courses:[]
    };
    await Category.find().select("name").then(result=>{
        result.forEach(async function (v,i) {
            data.category.push(v.name);
            data.category_id.push(v._id);
            // console.log(v._id);
        })
    })
    for (let i=0; i<data.category_id.length;i++){
        await   Course.find({category:data.category_id[i]}).then(result=>{
            // console.log(result.length)
            data.courses.push(result.length)
        })
    }

    res.json(data)
})

module.exports = router;
