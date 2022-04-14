const express = require('express');
const user = require('../controllers/userController')
const upload = require('../middlewares/uploadImage')
const {isAuthUser} = require('../middlewares/authUser')

const userRoutes = express.Router();

userRoutes.get('/', function (req, res) {
    res.json({message: "Welcome to my API"})
}) // CONSOLE RETURN TO SUCCESSFULLY CONNECT TO API

// USER ROUTES
userRoutes.get('/user', user.index) // GET ALL USERS
userRoutes.post('/sign-up/user', user.register) // CREATE NEW USER
userRoutes.delete('/user/delete/:id', user.delete) // DELETE USER
userRoutes.post('/sign-in/user', user.login) // LOGIN USER
userRoutes.post('/forgot-password', user.forgotPassword) // SEND LINK TO RESET PASSSWORD
userRoutes.post('/reset-password/:userId/:token', user.resetPassword) // RESET PASSWORD AND SAVE IN BD
userRoutes.post('/user/upload-profile', isAuthUser, upload.single('avatar'), user.uploadProfile) //UPLOAD IMAGE PROFILE

module.exports = userRoutes;