const pass = require("../Model/password.js");
const {transporter} = require("../Config/Nodemailer.js");
require('dotenv').config();
const express_Session = require('express-session');
 const check = async (req, res) => {
  
    console.log(req.body.key);
    if (req.body.key == process.env.ADMIN) {
        let OTP = Math.floor(100000 + Math.random() * 900000);
        
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

}
 const verifyOTP = async (req, res) => {
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
}

 const contact = async (req, res) => {
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
    } catch (error) 
    {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message.' });
    }
}

module.exports = { check, verifyOTP, contact };
