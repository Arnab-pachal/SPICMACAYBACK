const mongoose = require("mongoose");
const schema = new mongoose.Schema({
name : String,    
url : String,
})    
const Model = mongoose.model("Model",schema);
module.exports = Model; 