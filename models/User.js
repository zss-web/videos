const  db=require("../plugin/mongoose");

var userSchema=db.mongoose.Schema({
    username:String,
    userpwd:String,
    role:Number,
    email:String,
    create_at:Date,
    update_at:Date,
    headpic:String
})

var User=db.mongoose.model("User",userSchema);

module.exports=User;