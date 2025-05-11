const mongoose = require("mongoose");
const schema = new mongoose.Schema({
name : String,    
url : String,
})    
const vidModel = mongoose.model("vidModel",schema);
module.exports = vidModel; 