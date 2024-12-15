const mongoose = require("mongoose");

const schema = new mongoose.Schema({
name : String,    
code : String,
})    
const PassWord = mongoose.model("PassWord",schema);
module.exports = PassWord; 