const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require('cloudinary').v2;
const Mongo = require("./schema");
const methodOverride = require("method-override");
const vidMongo = require("./vidschema");
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(cors({origin:"https://spicmacay-e7ge.vercel.app"}));
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");


app.listen(3001, () => {
    console.log("app is listening on port 3001");
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));
const path = require('path');
const uploadPath = path.join(__dirname, 'uploads');


app.get("/",(req,res)=>{res.status(200).json("You are on the root route")});
//for getting photo
app.get("/getphoto", async (req, res) => {
   try{ const alldata = await Mongo.find({});
    res.status(200).json(alldata);}
           catch (error) {
            console.error('Error fetching photos:', error);
            res.status(500).json({ message: 'Error fetching photos' });
          }
    }
);
//for uploading photo
app.post('/uploadphoto', upload.single('file'), async (req, res) => {
    const path = req.file.path;
    console.log(req.file);
    try {
        const result = await cloudinary.uploader.upload(path, {
            public_id: req.file.originalname,
        });
        console.log(`This is cloudinary result :- ${result}\n`)
        const newPic = new Mongo({ name: req.file.originalname, url: result.url });
        console.log("This is newPic :-",newPic);
        await newPic.save();

        fs.unlink(path, (err) => {
            if (err) console.error('Error deleting file:', err);
            else console.log('File deleted successfully');
        });
        console.log("file saved successfully");
      
    } catch (error) {
        console.log('Upload error:', error);
        res.status(500).send('Error uploading file.');
    }
    res.status(200).json({ message: "File uploaded successfully!"});
});

//for deleting photo
app.delete("/deletephoto", async (req, res) => {
    let id = req.query.id;
    console.log(id);
    try{
    let doc = await Mongo.findByIdAndDelete(id);
    const public_id = doc.name;
    console.log(public_id)
    let del =await cloudinary.uploader.destroy(public_id);
    console.log(del);
    console.log(doc);
    res.status(200).send("file uploaded successfully");
    }
    catch(err){
        console.log("error occured");
    }
});



//routes for videos
//for getting videos
app.get("/getvideo",async(req,res)=>{
    try{
        const data = await vidMongo.find({});
        res.status(200).json(data);
    }
    catch(err){
        console.log(err);
        res.status(500).json(`some error occured ${err}`)
    }
})
//for uploading videos
app.post('/uploadvideo',upload.single('video'),async(req,res)=>{
    console.log(req.file);
    try{
        const result = await cloudinary.uploader.upload(req.file.path,{
            resource_type:'video',
        });
        console.log(result);
        const newvideo = new vidMongo({public_id:result.public_id,name:req.file.originalname,url:result.secure_url});
        await newvideo.save();
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
            else console.log('File deleted successfully');
        });
        res.status(200).json("video uploaded successfully");
    }
   catch(err){
    console.error('Error uploading video:', err);
    res.status(500).json({ err: 'Failed to upload video' });
   }
})
//for deleting videos
app.delete("/deletevideo", async (req, res) => {
    let id = req.query.id;
    console.log(id);
    try{
    let doc = await vidMongo.findOneAndDelete({public_id:id});
    await cloudinary.uploader.destroy(id);
    console.log(doc);
    res.status(200).send("video file uploaded successfully");
    }
    catch(err){
        console.log("error occured");
    }
});



