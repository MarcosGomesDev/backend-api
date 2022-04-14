require('dotenv').config();

const Seller = require('../models/seller')
const Product = require('../models/product')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require("crypto")
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail")
const cloudinary = require('../helper/cloudinaryAuth')

module.exports = {
    //RETURN ALL SELLERS
    async index(req, res) {

        const sellers = await Seller.find().populate('products')
        return res.json(sellers)
    },

    // RETURN ONLY THE LOGGED SELLER
    async logged(req, res) {
        const {seller} = req
        if(!seller) {
            return res.json({msg: 'Invalid authorization'})
        }

        const logged = await Seller.findOne({_id: seller._id}).populate('products')

        return res.json(logged)
    },

    //CREATE SELLER
    async register(req, res) {
        const {name, email, password, confPassword} = req.body
        try {
            //Validations
            if(!name) {
                return res.json({msg: 'O nome é obrigatório!'})
            }

            if(!email) {
                return res.json({msg: 'O email é obrigatório!'})
            }

            if(!password) {
                return res.json({msg: 'A senha é obrigatória!'})
            }

            if(password !== confPassword) {
                return res.json({msg: 'As senhas não correspondem!'})
            }

            // VERIFIED IF SELLER EXISTS
            const sellerExist = await Seller.findOne({email: email})

            if(sellerExist) {
                return res.json({msg: 'Por favor utilize outro email!'})
            }

            // HASHING THE PASSWORD
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            // METHOD OF SAVE NEW SELLER
            const seller = new Seller({
                name,
                email,
                password: passwordHash,
            });

            // SAVE NEW SELLER
            await seller.save()

            // AFTER SAVE SHOW THIS
            return res.json(seller)
        } catch (error) {
            // IF HAVE AN ERROR SHOW THIS
            return res.json({msg: 'Erro ao criar usuário, tente novamente mais tarde!'})
        }
    },

    // DELETE SELLER
    async delete(req, res) {
        const {seller} = req
        try {
            
            const result = await Seller.findByIdAndDelete({_id: seller._id})

            let productsID = result.products.map((p) => p._id)

            await Product.deleteMany({
                _id: {
                    $in: productsID,
                }
            })
            
            return res.json({msg: 'Usuário deletado com sucesso'})
        } catch (error) {
            return res.json({msg: 'Erro ao deletar o usuário'})
        }
    },

    // Login SELLER
    async login(req, res, next) {
        const {email, password} = req.body

        //Validations
        if(!email) {
            return res.json({msg: 'O email é obrigatório!'})
        }
        
        //Check if SELLER exists
        const seller = await Seller.findOne({email: email})

        if(!seller) {
            return res.json({msg: 'Usuário não encontrado!'})
        }

        if(!password) {
            return res.json({msg: 'A senha é obrigatória!'})
        }

        //Check if password match
        const checkPassword = await bcrypt.compare(password, seller.password)

        if(!checkPassword) {
            return res.json({msg: 'Senha inválida!'})
        }

        try {
            const secret = process.env.SECRET

            const token = jwt.sign({
                sellerId: seller._id
            }, secret, {expiresIn: '1d'})

            return res.json({msg: 'Autenticação realizada com sucesso', token, seller})


        } catch (err) {
            return res.json({msg: 'Erro ao logar usuário, tente novamente mais tarde!'})
        }
    },

    //SEND LINK FOR RESET PASSWORD
    async forgotPassword(req, res) {
        const {email} = req.body

        try{
            if(!email) {
                return res.json({msg: 'Por favor insira o email'})
            }

            const seller = await Seller.findOne({ email: email });
            if (!seller)
                return res.json({msg: "Nenhum usuário encontrado com este email"});

            let token = await Token.findOne({ sellerId: seller._id });
            if (!token) {
                token = await new Token({
                    userId: seller._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }

            const link = `${process.env.BASE_URL}/seller/password-reset/${seller._id}/${token.token}`;
            await sendEmail(seller.email, "Redefinir senha"
            ,`Se você solicitou uma redefinição de senha para ${seller.name}, clique no link abaixo. Se você não fez essa solicitação, ignore este email.\n${link}`);

            res.json({msg: "Link de redefinição de senha foi enviado ao email"});
            console.log(link);
        } catch (error) {
            res.json({msg: "Algum erro ocorreu"});
            console.log(error);
        }
    },

    //RESET AND SAVE NEW PASSWORD
    async resetPassword(req, res) {
        const {password, confPassword} = req.body
        try {
            if(!password) {
                return res.json({msg: "Por favor insira a senha!"})
            }

            if(password !== confPassword) {
                return res.json({msg: "As senhas não correspondem!"})
            }

            const seller = await Seller.findById(req.params.userId);
            if (!seller) {
                return res.send("invalid link or expired");
            }

            const token = await Token.findOne({
                sellerId: seller._id,
                token: req.params.token,
            });
            if (!token) {
                return res.send("Invalid link or expired");
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            
            Seller.findOneAndUpdate({_id: seller}, {password: passwordHash}, (updateErr) => {
                if(updateErr) {
                    return res.json({msg: 'Erro ao alterar a senha'})
                } else {

                    res.json({msg: "Senha alterada com sucesso!"});
                }
            })  
            await token.delete();     
        } catch (error) {
            res.json({msg: "An error occured"});
            console.log(error);
        }
    },

    //UPLOAD PROFILE
    async uploadProfile(req, res) {
        const {seller} = req
        if(!seller) {
            return res.json({msg: "Acesso não autorizado"})
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${seller._id}_profile`,
                width: 500,
                height: 500,
                crop: 'fill'
            })
            
            await Seller.findByIdAndUpdate(seller._id, {avatar: result.url})
            res.status(201).json({msg: 'imagem alterada com sucesso'})
        } catch (error) {
            res.json({msg: 'server error, try again'})
            console.log('erro ao subir imagem')
        }
    }
};