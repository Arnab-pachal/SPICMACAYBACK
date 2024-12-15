const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(`mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.ustzk.mongodb.net/mypass?retryWrites=true&w=majority`)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));
const schema = new mongoose.Schema({

name : String,    
code : String,
})    
const passWord = mongoose.model("passWord",schema);
module.exports = passWord; 