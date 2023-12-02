const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const cron = require("node-cron");
const User = require("./models/user");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
const port = process.env.PORT;
const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:3000"],
    credentials: true,
  })
);

const homeRoutes = require("./routes/home");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "Brevo",
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_PASS,
  },
});

// Script to Create User for test
// app.use(async (req, res, next) => {

//   console.log("Created")
//   const user = new User({ handle:"xx", email: "xx@icloud.com",  rate : xx  ,createdAt: new Date() });
//   try {
//     await user.save();
//   } catch (error) {
//     console.error("Error saving user: ", error);
//     return res.status(500).send("Internal Server Error");
//   }
//   next()
// })

// Delete user not verified from database
cron.schedule("0 0 * * *", async () => {
  try {
    await User.deleteMany({ isVerified: false });
  } catch (error) {
    console.error("Scheduled job error:", error);
  }
});

// Check Codeforces rating for users
cron.schedule("* * * * *", async () => {
  try {
    console.log("After 1 min");
    const users = await User.find({});
    let newRating, codeforcesRes, handle;

    users.forEach(async (user) => {
      handle = user.handle;
      codeforcesRes = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle}`
      );
      newRating = codeforcesRes.data.result[0].rating;
      console.log("New rating = ", newRating);
      if (newRating != user.rate) {
        const mailOptions = {
          from: "noreply@cp-rating-alert.com> ",
          to: user.email,
          subject: "New Rating Alert",
          text: `
            ${
              user.rate <= newRating
                ? Math.abs(user.rate - newRating)
                : -user.rate - newRating
            }
            ${user.rate} ----> ${newRating}
            `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
        user.rate = newRating;
        await user.save();
      }
    });
  } catch (err) {
    console.error(err);
  }
});

app.use(homeRoutes);

app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found</h1>");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("Server is up on port " + port);
    });
  })
  .catch((err) => {
    console.log(err);
  });
