const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.isAuthUser = async (req, res, next) => {
    if(req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]

        try {
            const decode = jwt.verify(token, process.env.SECRET)

            const user = await User.findById(decode.userId)
            if(!user) {
                return res.json({msg: 'Invalid authorization'})
            }

            req.user = user
            next()
        } catch (error) {
            if(error.name === 'JsonWebTokenError') {
                return res.json({msg: 'Invalid authorization'})
            }
            if(error.name === 'TokenExpiredError') {
                return res.json({msg: 'Session expired try sign in'})
            }
            return res.json({msg: 'Internal server error'})
        }

        
    } else {
        return res.json({msg: 'Invalid authorization'})
    }
}