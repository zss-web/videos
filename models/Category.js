const  db=require("../plugin/mongoose");

var categorySchema=db.mongoose.Schema({
    name:String,
   orderno:Number,
    pid:String

})

var Category=db.mongoose.model("Category",categorySchema);

module.exports=Category;