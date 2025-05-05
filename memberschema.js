const mongoose = require("mongoose");
const schema = new mongoose.Schema({
name : String,
Instaurl : String,
Linkedinurl : String,
Wing: String,
Year: String,
Position: String,
})    
const Member = mongoose.model("Memeber",schema);
module.exports = Member; 