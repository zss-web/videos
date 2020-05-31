var db = require("../plugin/mongoose");
var videoSchema=db.mongoose.Schema({
    name:String,
    source:String,
    poster:String,
    orderno:Number,
    section:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"Section"
    }
});

var Video = db.mongoose.model("Video",videoSchema);
module.exports = Video;
