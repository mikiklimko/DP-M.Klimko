const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    isVerified:{
        type: Boolean,
        default: false
    },

    date: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        required: false
    },
    adresa:{
        type: String,
        default: "none"
    },
    mesto:{
        type: String,
        default: "none"
    },
    PSC: {
        type: String,
        default: "0"
    },
    telefon:{
        type: String,
        default: "0"
    },
    ubytovanie:{
        type: String,
        default: "none"
    },
    strava:{
        type: String,
        default: "none"
    }


});

const User = mongoose.model('User', UserSchema);

module.exports = User;