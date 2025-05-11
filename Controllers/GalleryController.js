
const Mongo = require('../Model/schema.js');
const cloudinary = require('cloudinary').v2;
const vidMongo = require('../Model/vidschema.js'); 
const photoget = async (req, res) => {
    try {
        const alldata = await Mongo.find({});
        res.status(200).json(alldata);
    }
    catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ message: 'Error fetching photos' });
    }
}


const photoupload = async (req, res) => {
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
}

 const photodelete =  async (req, res) => {
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
}

const videoget = async (req, res) => {
    try {
        const data = await vidMongo.find({});
        console.log(data);
        res.status(200).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(`some error occured ${err}`)
    }
}
const videoupload = async (req, res) => {

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
};

const videodelete = async (req, res) => {
     let id = req.query.id;
    console.log(id);
    try {
        let doc = await Mongo.findOneAndDelete({ _id: id });
        await cloudinary.uploader.destroy(id);
        console.log(doc);
        res.status(200).send("video file deleted successfully");
    }
    catch (err) {
        console.log("error occured");
    }
}


module.exports={
    photoget,
    photoupload,
    photodelete,
    videoget,
    videoupload,
    videodelete
}