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
const Member = require("./memberschema.js");
const Aditipixel = require("./pixeldb.js");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

const app = express();
app.use(cookieParser());
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: "uudf karl lmuj zbjn",
    },
});


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

app.post('/uploadphoto', upload.single("file"), async (req, res) => {
    try {
        console.log("Incoming file data:", req.file); // Logs the uploaded file metadata
 
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
        console.log(data);
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
    let doc =await Member.findOne({ name: req.body.key });
    console.log(req.body.key);
    if (doc != null) {
        let OTP = Math.floor(100000 + Math.random() * 900000);
        console.log("This is the code: " + doc.code);
        transporter.sendMail({
            from: process.env.EMAIL,
            to: "arnabcoder03@gmail.com",
            subject: "SPICMACAY",
            text: "You Want To LoggedIn and upload Photo and Video In Website .Your code is: " + OTP,
        });
        await pass.deleteMany({});
        const newPass = new pass({
            otp: OTP,
            name:req.body.key,
            TimeRanges: Date.now(),
            isVerified: false,})
        console.log("This is the OTP: " + OTP);
        console.log(OTP);
        res.status(200).json({ message: "OTP sent successfully!" });
        await newPass.save();
    
           }
    else {
        res.status(504).json("Sorry! Only Admins can upload and delete the data");
    }

})
app.post("/verify-otp", async (req, res) => {
    const { otp, key } = req.body;
    console.log("This is the OTP: " + otp);
    console.log("This is the key: " + key);
    const doc = await pass.findOne({ otp: otp, name: key });
    if (doc != null) {
        timeDiff = Date.now() - doc.TimeRanges;
        if(timeDiff > 5*60*1000){
            res.status(504).json("OTP expired! Please try again.");
            pass.deleteOne({ otp: otp, name: key });
            return;
        }
        console.log(doc);
        doc.isVerified = true;
        await pass.deleteOne({ otp: otp, name: key });
        res.status(200).json({ message: "OTP verified successfully!" });
    }
    else {
        res.status(504).json("Wrong OTP");
    }
})


//Members Routes

app.get("/getmembers", async (req, res) => {
    try {
        const { name, year } = req.query; // Correct way to get query parameters
        console.log(name, year);
        const alldata = await Member.find({ name: name, Year: year });
      
        res.status(200).json(alldata);
    }
    catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

app.post('/uploadmembers', upload.single('file'), async (req, res) => {
    try {
        console.log("Incoming member data:", req.body);
        const find = await Member.findOne({ name: req.body.name , Year: req.body.year ,Instaurl: req.body.instaurl, Linkedinurl: req.body.linkedinurl });
        if (find) {
            console.log("Member already exists:", find);
            return res.status(400).json({ message: "Member already exists!" });
        }
        else{
        const newMember = new Member({
            name: req.body.name,
            Instaurl: req.body.instaurl,
            Linkedinurl: req.body.linkedinurl,
            Wing: req.body.wing,
            Year: req.body.year,
            Position: req.body.position,
        });

        await newMember.save();
    

        console.log("Member saved successfully:", newMember);
        res.status(200).json({ message: "Member uploaded successfully!", member: newMember });}
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Error uploading member.", error });
    }
});

app.delete("/deletemember", async (req, res) => {
    let id = req.query.id;
    console.log(id);
    try {
        let doc = await Member.findByIdAndDelete(id);
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

app.post("/updatemember", async (req, res) => {
    let id = req.query.id;
    console.log(id);
    try {
        
        let existingDoc = await Member.findById(id);
        if (!existingDoc) {
            return res.status(404).send("Member not found");
        }

        const updatedData = {
            name: req.body.name || existingDoc.name,
            Image: req.body.Image || existingDoc.Image,
            Instaurl: req.body.Instaurl || existingDoc.Instaurl,
            Linkedinurl: req.body.Linkedinurl || existingDoc.Linkedinurl,
            Wing: req.body.Wing || existingDoc.Wing,
            Year: req.body.Year || existingDoc.Year,
            Position: req.body.Position || existingDoc.Position,
        };

        const doc = await Member.findByIdAndUpdate(id, updatedData, { new: true });
        console.log(doc);
        res.status(200).send("File updated successfully");
    } catch (err) {
        console.log("Error occurred:", err);
        res.status(500).send("An error occurred while updating the member");
    }
});
app.post("/contact", async (req, res) => {
    console.log(req.body);
    const { name, email, message } = req.body;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: "arnabcoder03@gmail.com",
            subject: "Contact Form Submission",
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });
        res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message.' });
    }
}
);


//for aditi event
app.post("/aditiupload", upload.single("file"), async (req, res) => {
    try {
        console.log("Incoming file data:", req.file); // Logs the uploaded file metadata
 
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image', public_id: req.file.originalname },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer); // Pass the buffer to the stream
        });

        console.log(`This is Cloudinary result: ${result}`);
        const newPic = new Aditipixel({name: req.file.originalname, mediaUrl: result.secure_url, department: req.body.department, college: req.body.college, year: req.body.year, category: req.body.category, description: req.body.description, mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image', publicId: result.public_id });

        console.log("This is newPic:", newPic);
        await newPic.save();

        console.log("File saved successfully in database and Cloudinary.");
        res.status(200).json({ message: "File uploaded successfully!", file: newPic });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file.', error });
    }
});
app.get("/aditiget", async (req, res) => {
    try {
        const alldata = await Aditipixel.find({});
        console.log(alldata);
        res.status(200).json(alldata);
    }
    catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ message: 'Error fetching photos' });
    }
}
);
//automatically deletes from cloudinary after 3 years
//user need to delete manually from database and cloudinary
cron.schedule("0 0 * * *", async () => {
    //make the time period 3 years
    const threshold = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const oldMedia = await Aditipixel.find({ createdAt: { $lt: threshold } });

    for (const item of oldMedia) {
        const options = item.type === 'video' ? { resource_type: 'video' } : {};
        await cloudinary.uploader.destroy(item.publicId, options);
        await Aditipixel.findByIdAndDelete(item._id);
    }

    console.log("Old media cleaned up.");
});