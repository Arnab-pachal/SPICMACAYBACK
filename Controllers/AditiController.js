const Aditi = require('../Model/pixeldb.js');
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');

// Upload controller
const AditiUpload = async (req, res) => {
    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
                    public_id: req.file.originalname
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const newPic = new Aditi({
            name: req.file.originalname,
            mediaUrl: result.secure_url,
            department: req.body.department,
            college: req.body.college,
            year: req.body.year,
            category: req.body.category,
            description: req.body.description,
            mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
            publicId: result.public_id
        });

        await newPic.save();
        res.status(200).json({ message: "File uploaded successfully!", file: newPic });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file.', error });
    }
};

// Get controller
const AditiGet = async (req, res) => {
    try {
        const alldata = await Aditi.find({});
        res.status(200).json(alldata);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ message: 'Error fetching photos' });
    }
};

// Cron job to auto-delete after 3 years
cron.schedule("0 0 * * *", async () => {
    const threshold = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    const oldMedia = await Aditi.find({ createdAt: { $lt: threshold } });

    for (const item of oldMedia) {
        const options = item.mediaType === 'video' ? { resource_type: 'video' } : {};
        await cloudinary.uploader.destroy(item.publicId, options);
        await Aditi.findByIdAndDelete(item._id);
    }

    console.log("Old media cleaned up.");
});

module.exports = {
    AditiUpload,
    AditiGet
};
