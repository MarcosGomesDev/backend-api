const Product = require('../models/product')
const Seller = require('../models/seller')
const Category = require('../models/category')
const subCategory = require('../models/subCategory')
const cloudinary = require('../helper/cloudinaryAuth')

module.exports = {
    // RETURN ALL PRODUCTS
    async index(req, res) {
        try {
            const product = await Product.find()
                .populate('category')
                .populate('subcategory')
                .populate('seller')
            return res.json(product)
        } catch (error) {
            return res.json({msg: 'Internal Server Error'})
        }
    },

    async search(req, res) {
        const product = req.body
        try {
            const response = await Product.find()
            return res.json(response)
        } catch (error) {
            return res.json({msg: 'Erro ao retornar produtos com esse filtro'})
        }
    },

    // CREATE NEW PRODUCT
    async create(req, res) {
        const {id} = req.params
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

        if(!categorySend) {
            return res.json({msg: 'Categoria não existe, por favor escolha outra'})
        }

        const subCategorySend = await subCategory.findOne({name: subcategory})

        if(!subCategorySend) {
            return res.json({msg: 'Sub Categoria não existe, por favor escolha outra'})
        }

        const images = []
        const publicImages = []

        for (let index = 0; index < req.files.length; index++) {
            const file = req.files[index]

            const result = await cloudinary.uploader.upload(file.path, {
                public_id: `${file.filename}-${Date.now()}`,
                width: 500,
                height: 500,
                crop: 'fill',
                folder: "Products Images"
            })
            images.push(result.secure_url)
            publicImages.push(result.public_id)
        }

        const product = await Product.create({
            name,
            price,
            seller: id,
            images,
            publicImages,
            category: categorySend,
            subcategory: subCategorySend
        })

        const seller = await Seller.findOne({_id: id})

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

    async delete(req, res) {
        const {id} = req.params

        try {
            const prod = await Product.findById({_id: id})
            for (let index = 0; index < prod.publicImages.length; index++) {
                const file = prod.publicImages[index]
    
                await cloudinary.uploader.destroy(file)
            }
            await Product.findByIdAndDelete({_id: id})
            await Seller.findOneAndUpdate({products: id},
                {
                    $pull: {
                        products: id
                    }
                }
            )
            
            return res.json({msg: 'Produto deletado com sucesso'})
        } catch (error) {
            console.log(error)
            return res.json({msg: 'Internal Server Error'})
        }
    },

    async addComment(req, res) {
        const {id} = req.params
        const {name, comment} = req.body

        try {
            const comments = []
            comments.push({name: name, comment: comment})
            await Product.findOneAndUpdate({_id: id}, {
                $push: {
                    comments
                }
            })

            return res.json({msg: 'comentário inserido com sucesso!', comments})

        } catch (error) {
            return res.json(error)
        }
    }
}