const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String},
    email: {type: String},
    password: {type: String},
    avatar: String,
    admin: Boolean,
}, {
    timestamps: true
} );

module.exports = mongoose.model('User', userSchema);