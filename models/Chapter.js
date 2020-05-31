var db = require("../plugin/mongoose");
var chapterSchema=db.mongoose.Schema({
    name:String,
    content:String,
    orderno:Number,
    course:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }
});

var Chapter = db.mongoose.model("Chapter",chapterSchema,'chapters');
module.exports = Chapter;
