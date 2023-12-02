const User = require("../models/user");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const axios = require("axios");

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "Brevo",
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_PASS,
  },
});

exports.postSubscribe = async (req, res, next) => {
  const handle = req.body.handle;
  try {
    if (handle == "") {
      res.json({ error: "Enter your handle" });
      return;
    }
    const codeforcesRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    const email = codeforcesRes.data.result[0].email;
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      res.json({ error: "You are actually subscribed" });
      return;
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: true,
      upperCase: false,
      specialChars: false,
    });

    const mailOptions = {
      from: "info@cp-rating-alert.com",
      to: email,
      subject: "Email Verification OTP for Subscribe",
      text: `Your OTP for email verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("email", email, {
        sameSite: "None",
        secure: true,
        httpOnly: true,
      })
    );

    res.cookie("email", email, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      path: "/",
    });

    console.log(`otp in postSubscribe = ${otp}`);
    const rate = codeforcesRes.data.result[0].rating;
    const user = new User({
      handle,
      email,
      isVerified: false,
      otp,
      rate,
      createdAt: new Date(),
    });
    await user.save();
    res.json({ message: "verfy your email", email });
  } catch (error) {
    console.log(error);
    // if(error.response.data.comment === `handles: User with handle ${handle} not found`){
    //   res.status(404).json({error : "User with this handle not found"});
    // }
  }
};

exports.postSubscribeVerify = async (req, res, next) => {
  const otp = req.body.otp;
  const email = req.body.email;

  console.log("########");
  console.log(`otp in postSubscribeVerify = ${otp}`);
  console.log(`email in postSubscribeVerify = ${email}`);
  console.log("########");

  try {
    const user = await User.findOne({ email });
    if (otp === user.otp) {
      user.isVerified = true;
      await user.save();
      res.json({ message: "Email verified successfully." });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error verifying email" });
  }
};

exports.postUnsubscribe = async (req, res, next) => {
  const handle = req.body.handle;

  try {
    if (!handle) {
      res.json({ error: "Enter your handle" });
      return;
    }

    const user = await User.findOne({ handle: handle });

    if (!user) {
      res.json({ error: "You are actually unsubscribed" });
      return;
    }
    const email = user.email;

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: true,
      upperCase: false,
      specialChars: false,
    });
    user.otp = otp;
    user.save();

    const mailOptions = {
      from: "info@cp-rating-alert.com",
      to: email,
      subject: "Email Verification OTP for Unsubscribe",
      text: `Your OTP for email verification is: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({ message: "verfy your email", email });
  } catch (error) {
    console.log(error);
  }
};

exports.postUnsubscribeVerify = async (req, res, next) => {
  const otp = req.body.otp;
  const email = req.body.email;

  try {
    const user = await User.findOne({ email });
    if (otp === user.otp) {
      await User.deleteOne({ email: email });
      res.json({ error: "Email Unsubscribe successfully." });
    } else {
      console.log("Invalid OTP");
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error Unsubscribe email" });
  }
};
