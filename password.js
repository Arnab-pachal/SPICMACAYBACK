const mongoose = require("mongoose");

const schema = new mongoose.Schema({
otp: {
    type: String,
    required: true,
},
name:String,
TimeRanges: {
    type: String,
    required: true,
},
isVerified: {
    type: Boolean,
    default: false,
},
})    
const PassWord = mongoose.model("PassWord",schema);
module.exports = PassWord; 