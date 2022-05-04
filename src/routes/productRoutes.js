const express = require('express');
const product = require('../controllers/productController')
const {isAuthSeller} = require('../middlewares/authSeller');
const { isAuthUser } = require('../middlewares/authUser');
const upload = require('../middlewares/uploadImage')

const productRoutes = express.Router()

// PRODUCT ROUTES
productRoutes.get('/products', product.index) // RETURN ALL PRODUCTS
productRoutes.get('/products/search', product.search) // SEARCH ANY PRODUCT
productRoutes.post('/:id/product/create', upload.array('images'), product.create) // CREATE NEW PRODUCT
productRoutes.post('/product/:id/comment/new', product.addComment)
productRoutes.post('/product/:id', upload.array('images'), product.update) // UPDATE PRODUCT
productRoutes.delete('/product/:id/delete', product.delete) // DELETE PRODUCT

module.exports = productRoutes