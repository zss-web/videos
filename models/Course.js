var db = require("../plugin/mongoose");
var courseSchema=db.mongoose.Schema({
    name:String,
    content:String,
    publisher:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    teacher:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    thumbnail:String,
    category:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:'Subcat'
    },
    learners:{
        type:Number,
        default:1
    },
    create_at:{
        type:Date,
        default:Date.now()
    },
    update_at:{
        type:Date,
        default:Date.now()
    }
});

var Course = db.mongoose.model("Course",courseSchema);
module.exports = Course;
