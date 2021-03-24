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
        required: false,
        default: "none"
    },
    mesto:{
        type: String,
        required: false,
        default: "none"
    },
    PSC: {
        type: Number,
        required: false,
        default: "0"
    },
    telefon:{
        type: Number,
        required: false,
        default: "0"
    }


});

const User = mongoose.model('User', UserSchema);

module.exports = User;