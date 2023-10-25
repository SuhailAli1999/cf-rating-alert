const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    isVerified: {
        type: Boolean,
    },
    otp: {
        type: String,
    },
    rate: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },

})

module.exports = mongoose.model('User', userSchema)