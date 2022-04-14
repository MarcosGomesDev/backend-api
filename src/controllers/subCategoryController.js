require('dotenv').config()

const subCategory = require('../models/subCategory')
const Category = require('../models/category')

module.exports = {
    async index(req, res) {
        const subCategories = await subCategory.find()

        return res.json(subCategories)
    },

    async create(req, res) {
        const {user} = req
        const {name, category} = req.body

        if(!user) {
            return res.json({msg: 'Invalid authorization'})
        }

        if(user.admin != true) {
            return res.json({msg: 'Invalid authorization, u are not administrator'})
        }

        const categoryExist = await Category.findOne({name: category})

        if(!categoryExist) {
            return res.json({msg: 'Category not found'})
        }

        if(!name) {
            return res.json({msg: 'Por favor insira a sub categoria'})
        }

        const subCategoryExist = await subCategory.findOne({name: name})

        if(subCategoryExist) {
            return res.json({msg: 'sub Categoria já existente!'})
        }

        try {
            const result = new subCategory({
                name: name,
                createdBy: user._id
            })

            categoryExist.sub_categories.push(result)
            await categoryExist.save()
            await result.save()

            return res.json({msg: 'Sub Categoria criada com sucesso'})
        } catch (error) {
            return res.json({msg: 'Internal Server Error'})
        }
    }
}