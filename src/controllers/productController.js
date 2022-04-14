const Product = require('../models/product')
const Seller = require('../models/seller')
const Category = require('../models/category')
const subCategory = require('../models/subCategory')
const cloudinary = require('../helper/cloudinaryAuth')

module.exports = {
    // RETURN ALL PRODUCTS
    async index(req, res) {
        try {
            const product = await Product.find().populate('category').populate('subcategory')
            return res.json(product)
        } catch (error) {
            console.log(error)
            return res.json({msg: 'Internal Server Error'})
        }
    },

    // CREATE NEW PRODUCT
    async create(req, res) {
        const {seller} = req
        const {name, price, category, subcategory} = req.body

        if(!name) {
            return res.json({msg: 'Por favor insira o nome do produto'})
        }

        if(!price) {
            return res.json({msg: 'Por favor insira o preço do produto'})
        }

        if (req.files.length > 3) {
            return res.json({msg: 'Quantidade de imagens não suportada'})
        }

        const categorySend = await Category.findOne({name: category})

        console.log({ categorySend })

        if(!categorySend) {
            return res.json({msg: 'Categoria não existe, por favor escolha outra'})
        }

        const subCategorySend = await subCategory.findOne({name: subcategory})

        if(!subCategorySend) {
            return res.json({msg: 'Sub Categoria não existe, por favor escolha outra'})
        }

        const images = []

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index]

            const result = await cloudinary.uploader.upload(file.path, {
                public_id: `${file.filename}-${Date.now()}`,
                width: 500,
                height: 500,
                crop: 'fill'
            })

            images.push(result.secure_url)
        }

        const product = await Product.create({
            name,
            price,
            seller: seller._id,
            images,
            category: categorySend,
            subcategory: subCategorySend
        })

        try {
            seller.products.push(product)
            await seller.save()
            await product.save()
            return res.json({msg: 'Product saved', product})
        } catch (error) {
            return res.json({msg: 'Internal Server Error'})
        }
    },

    //UPDATE PRODUCT
    async update(req, res) {
        const _id = req.params.id
        const {price, description} = req.body
    },

    async delete(req,res) {
        const {seller} = req
        const prod = req.headers.prod

        try {
            await Product.findByIdAndDelete({_id: prod})
            await Seller.findOneAndUpdate({_id: seller._id},
                {
                    $pull: {
                        products: prod
                    }
                }
            )
            
            return res.json({msg: 'Produto deletado com sucesso'})
        } catch (error) {
            return res.json({msg: 'Internal Server Error'})
        }
    }
}