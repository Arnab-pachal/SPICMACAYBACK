const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const Mongo = require("./schema.js");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const vidMongo = require("./vidschema.js");
const pass = require("./password.js");
require('dotenv').config();
const cors = require('cors');
const cookieParser = require("cookie-parser");
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
// Middleware
app.use(cors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
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


const storage = multer.memoryStorage();

const upload = multer({ storage });

app.get("/", (req, res) => { res.status(200).json("You are on the root route") });
//for getting photo
app.get("/getphoto", async (req, res) => {
    try {
        const alldata = await Mongo.find({});
        res.status(200).json(alldata);
    }
    catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ message: 'Error fetching photos' });
    }
}
);

app.post('/uploadphoto', upload.single('file'), async (req, res) => {
    try {
        console.log(req.file); // Logs the uploaded file metadata
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { public_id: req.file.originalname },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer); // Pass the buffer to the stream
        });

        console.log(`This is Cloudinary result: ${result}`);
        const newPic = new Mongo({ name: req.file.originalname, url: result.secure_url });
        console.log("This is newPic:", newPic);
        await newPic.save();

        console.log("File saved successfully in database and Cloudinary.");
        res.status(200).json({ message: "File uploaded successfully!", file: newPic });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file.', error });
    }
});


//for deleting photo
app.delete("/deletephoto", async (req, res) => {
    let id = req.query.id;
    console.log(id);
    try {
        let doc = await Mongo.findByIdAndDelete(id);
        const public_id = doc.name;
        console.log(public_id)
        let del = await cloudinary.uploader.destroy(public_id);
        console.log(del);
        console.log(doc);
        res.status(200).send("file deleted successfully");
    }
    catch (err) {
        console.log("error occured");
    }
});



//routes for videos
//for getting videos
app.get("/getvideo", async (req, res) => {
    try {
        const data = await vidMongo.find({});
        res.status(200).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(`some error occured ${err}`)
    }
})
//for uploading videos
app.post('/uploadvideo', upload.single('video'), async (req, res) => {
    try {
        console.log(req.file); // Logs the uploaded video metadata
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'video', public_id: req.file.originalname },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer); // Pass the buffer to the stream
        });

        console.log(`This is Cloudinary result: ${result}`);
        const newVideo = new vidMongo({
           
            name: req.file.originalname,
            url: result.secure_url,
        });
        console.log("This is newVideo:", newVideo);
        await newVideo.save();

        console.log("Video saved successfully in database and Cloudinary.");
        res.status(200).json({ message: "Video uploaded successfully!", video: newVideo });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading video.', error });
    }
});

//for deleting videos
app.delete("/deletevideo", async (req, res) => {
    let id = req.query.id;
    console.log(id);
    try {
        let doc = await vidMongo.findOneAndDelete({ _id: id });
        await cloudinary.uploader.destroy(id);
        console.log(doc);
        res.status(200).send("video file deleted successfully");
    }
    catch (err) {
        console.log("error occured");
    }
});


app.post("/check", async (req, res) => {
    let doc =await pass.findOne({ name: req.body.key });
    if (doc != null) {
        console.log(doc.code);
        res.status(200).json({code : doc.code});
    }
    else {
        res.status(504).json("This is Not valid username .please type valid username");
    }

})

