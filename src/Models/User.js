const mongoose = require('mongoose');

const User = mongoose.model('User', {
    nome: String,
    email: String,
    senha: String,
    createdAt: { 
        type: Date,
        required: true,
        default: Date.now(),
    },
    avatar: Buffer,
})

module.exports = User;