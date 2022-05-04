const express = require('express');
const category = require('../controllers/categoryController')

const categoryRoutes = express.Router()

// PRODUCT ROUTES
categoryRoutes.get('/categories', category.index) // RETURN ALL PRODUCTS

module.exports = categoryRoutes