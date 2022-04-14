const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = Schema({
    name: String,
    descrip: String,
    price: Number,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'sub_category'
    },
    images: [{type: String}],
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)