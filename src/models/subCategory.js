const mongoose = require('mongoose')
const {Schema} = mongoose

const subCategorySchema = Schema({
    name: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, 
    {timestamps: true}
)

module.exports = mongoose.model('sub_category', subCategorySchema)