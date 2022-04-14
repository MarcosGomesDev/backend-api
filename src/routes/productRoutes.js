const express = require('express');
const product = require('../controllers/productController')
const {isAuthSeller} = require('../middlewares/authSeller');
const { isAuthUser } = require('../middlewares/authUser');
const upload = require('../middlewares/uploadImage')

const productRoutes = express.Router()

// PRODUCT ROUTES
productRoutes.get('/products', product.index) // RETURN ALL PRODUCTS
productRoutes.post('/product/create', isAuthSeller, upload.array('images'), product.create) // CREATE NEW PRODUCT
productRoutes.post('/product/:id', upload.array('images'), product.update) // UPDATE PRODUCT
productRoutes.delete('/product/delete', isAuthSeller, product.delete) // DELETE PRODUCT

module.exports = productRoutes