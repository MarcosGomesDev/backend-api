const mongoose = require('mongoose');
const {Schema} = mongoose
const sellerSchema = Schema({
    name: {type: String},
    email: {type: String},
    password: {type: String},
    address: {type: String},
    avatar: {type: String},
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
}, {
    timestamps: true
} );

module.exports = mongoose.model('Seller', sellerSchema);