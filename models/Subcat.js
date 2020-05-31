var db = require("../plugin/mongoose");
var subcatSchema=db.mongoose.Schema({
    name:String,
    orderno:Number,
    category:{
        type:db.mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }
});

var Subcat = db.mongoose.model("Subcat",subcatSchema,'subcat');
module.exports = Subcat;
