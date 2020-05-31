var db = require("../plugin/mongoose");
var sectionSchema=db.mongoose.Schema({
    name:String,
    content:String,
    orderno:String,
    chapter:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"Chapter"
    }
});

var Section = db.mongoose.model("Section",sectionSchema);
module.exports = Section;
