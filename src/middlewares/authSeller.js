const jwt = require('jsonwebtoken')
const Seller = require('../models/seller')

exports.isAuthSeller = async (req, res, next) => {
    if(req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]

        try {
            const decode = jwt.verify(token, process.env.SECRET)

            const seller = await Seller.findById(decode.sellerId)
            if(!seller) {
                return res.status(401).json({msg: 'Invalid authorization'})
            }

            req.seller = seller
            next()
        } catch (error) {
            if(error.name === 'JsonWebTokenError') {
                return res.status(400).json({msg: 'Invalid authorization'})
            }
            if(error.name === 'TokenExpiredError') {
                return res.status(400).json({msg: 'Session expired try sign in'})
            }
            return res.status(500).json({msg: 'Internal server error'})
        }

        
    } else {
        return res.status(400).json({msg: 'Invalid authorization'})
    }
}