
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  name: String,
  department: String,
  college: String,
  year: String,
  category: {
    type: String,
 // restrict to these values
    required: true
  },
  description: String,
  mediaUrl: String,
    mediaType: {
        type: String,
        enum: ['image', 'video'], 
        required: true
    },
  publicId: String,
  cheers: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now, expires: 94608000 }
});

const Aditipixel = mongoose.model("Pixel",PostSchema);
module.exports = Aditipixel; 