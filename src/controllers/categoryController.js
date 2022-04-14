require('dotenv').config()

const Category = require('../models/category')
const Product = require('../models/product')

module.exports = {
    async index(req, res) {
        const categories = await Category.find().populate('sub_categories')

        return res.json(categories)
    },
    
    async create(req, res) {
        const {user} = req
        const {name} = req.body

        if(!user) {
            return res.json({msg: 'Invalid authorization'})
        }

        if(user.admin != true) {
            return res.json({msg: 'Invalid authorization, u are not administrator'})
        }

        if(!name) {
            return res.json({msg: 'Por favor insira a nova categoria!'})
        }

        const categoryExist = await Category.findOne({name: name})

        if(categoryExist) {
            return res.json({msg: 'Categoria já existente!'})
        }

        try {
            const category = new Category({
                name: name,
                createdBy: user._id
            })

            await category.save()
            return res.json({msg: 'Categoria criada com sucesso'})
        } catch (error) {
            return res.json({msg: 'Internal server error'})
        }
    },

    async delete(req, res) {
        const {user} = req
        const cat = req.headers.category

        if(user.admin != true) {
            return res.json({msg: 'Invalid authorization, u are not administrator'})
        }

        let query = {category: cat}
        let newObj = {$set: {category: null}}

        try {
            await Category.findByIdAndDelete({_id: cat})
            await Product.updateMany(query, newObj)

            return res.json({msg: 'Categoria deletada com sucesso'})
        } catch (error) {
            return res.json({msg: 'Internal server error'}) 
        }
    }
}