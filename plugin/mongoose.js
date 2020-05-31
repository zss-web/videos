const  mongoose=require("mongoose");
//连接MongoDB数据库
mongoose.connect('mongodb://localhost/videos',{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("数据库连接成功")
});

module.exports={mongoose};