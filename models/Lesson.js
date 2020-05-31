var db = require("../plugin/mongoose");
var lessonSchema=db.mongoose.Schema({
   name:String,
    poster:String,
    videos:String,
    section:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"Section"
    },
    view:{
       type: Number,
        default:1
    }


});

var Lesson = db.mongoose.model("Lesson",lessonSchema);
module.exports = Lesson;
