const express = require('express');
const seller = require('../controllers/sellerController')
const {isAuthSeller} = require('../middlewares/authSeller')
const upload = require('../middlewares/uploadImage')

const sellerRoutes = express.Router()

// SELLER ROUTES
sellerRoutes.get('/sellers', isAuthSeller, seller.index) // RETURN SELLERS
sellerRoutes.get('/seller/:id', seller.seller) // RETURN ONE SELLER
sellerRoutes.get('/seller', isAuthSeller, seller.logged) // RETURN LOGGED SELLER AND OUR PRODUCTS
sellerRoutes.post('/sign-up/seller', seller.register) // CREATE NEW SELLER
sellerRoutes.post('/sign-in/seller', seller.login) // LOGIN SELLER
sellerRoutes.post('/seller/forgot-password', seller.forgotPassword) // SEND LINK TO RESET PASSSWORD
sellerRoutes.post('/seller/reset-password/:userId/:token', seller.resetPassword) // RESET PASSWORD AND SAVE IN BD
sellerRoutes.post('/seller/upload-profile', isAuthSeller, upload.single('avatar'), seller.uploadProfile) // SAVE PROFILE
sellerRoutes.delete('/seller/', isAuthSeller, seller.delete) // DELETE SELLER

module.exports = sellerRoutes