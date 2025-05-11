const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
require('dotenv').config();
const session = require('express-session');
const cors = require('cors');
const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");
const GalleryRoute = require("./Route/GalleryRoutes");
const AditiRoute = require("./Route/AditiRoute");
const ValidationRoute = require("./Route/ValidationRoute");
const app = express();
app.use(cookieParser());

async function connectToDB() {
    try {
      await mongoose.connect(`mongodb+srv://ap23cs8031:ayantika9@cluster0.ustzk.mongodb.net/newdatabase?retryWrites=true&w=majority&appName=Cluster0`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB Atlas!');
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas:', error);
      process.exit(1);
    }
  }
  
  connectToDB().then(() => {
    console.log("successfully connected");
  });

app.use(cors({
    origin: "https://spicvitee.onrender.com/",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    sameSite: 'none', // or 'none' if doing cross-site requests with HTTPS
    maxAge: 1000 * 60 * 20, // 1 day
  },
}));
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");


app.listen(8080, () => {
    console.log("app is listening on port 8080");
});
app.get("/", (req, res) => { res.status(200).json("You are on the root route") });

app.use("/gallery", GalleryRoute);
app.use("/aditi", AditiRoute);
app.use("/valid", ValidationRoute);
