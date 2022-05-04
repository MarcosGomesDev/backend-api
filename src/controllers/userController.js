require('dotenv').config();

const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require("crypto")
const Token = require("../models/token");
const sendMail = require("../utils/sendEmail")
const cloudinary = require('../helper/cloudinaryAuth')

module.exports = {
    //READ USERS
    async index(req, res) {
        // GET ALL USERS
        try {
            const users = await User.find()
            return res.json(users)
            
        } catch (error) {
            return res.json({msg: 'Internal Server Error'})
        }
    },

    //CREATE USER
    async register(req, res) {
        const {name, email, password} = req.body

        //Validations
        if(!name) {
            return res.json({err: 'O nome é obrigatório!'})
        }

        if(!email) {
            return res.json({err: 'O email é obrigatório!'})
        }

        if(!password) {
            return res.json({err: 'A senha é obrigatória!'})
        }

        // VERIFIED IF USER EXISTS
        const userExist = await User.findOne({email: email})

        if(userExist) {
            return res.json({err: 'Este email já está sendo utilizado!'})
        }

        // HASHING THE PASSWORD
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // METHOD OF SAVE NEW USER
        const user = new User({
            name,
            email,
            password: passwordHash,
            admin: false,
        });

        try {
            // SAVE NEW USER
            await user.save()

            // AFTER SAVE SHOW THIS
            return res.json({msg: 'Úsuario criado com sucesso!'})
        } catch (error) {
            // IF HAVE AN ERROR SHOW THIS
            return res.json({error: 'Erro ao criar usuário, tente novamente mais tarde!'})
        }
    },

    // DELETE USER
    async delete(req, res) {
        // // const {user} = req
        // if(!user) {
        //     return res.status(401).json({msg: "Acesso não autorizado"})
        // }
        const id = req.params.id
        try {
            await User.findByIdAndDelete({_id: id})
            return res.json({msg: 'Usuário deletado com sucesso'})
        } catch (error) {
            return res.json({msg: 'Erro ao deletar o usuário'})
        }
    },

    // Login user
    async login(req, res) {
        const {email, password} = req.body

        //Validations
        if(!email) {
            return res.json({msg: 'O email é obrigatório!'})
        }
        
        //Check if user exists
        const user = await User.findOne({email: email})

        if(!user) {
            return res.json({err: 'Não existe nenhum usuário com este email!'})
        }

        if(!password) {
            return res.json({err: 'A senha é obrigatória!'})
        }

        //Check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword) {
            return res.json({err: 'Senha inválida!'})
        }

        try {
            const secret = process.env.SECRET

            const token = jwt.sign({
                userId: user._id
            }, secret, {expiresIn: '1d'})

            return res.json({user, token})


        } catch (err) {
            return res.json({error: 'Erro ao logar usuário, tente novamente mais tarde!'})
        }
    },

    // SEND LINK FOR RESET PASSWORD
    async forgotPassword(req, res) {
        const {email} = req.body

        try{
            if(!email) {
                return res.json({msg: 'Por favor insira o email'})
            }

            const user = await User.findOne({ email: email });
            if (!user)
                return res.json({msg: "Nenhum usuário encontrado com este email"});

            let token = await Token.findOne({ userId: user._id });
            if (!token) {
                token = await new Token({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }

            const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
            await sendMail(user.email, "Redefinir senha"
                ,`Se você solicitou uma redefinição de senha para ${user.name}, clique no link abaixo. Se você não fez essa solicitação, ignore este email.\n${link}`);

            res.json({msg: "Link de redefinição de senha foi enviado ao email"});
        } catch (error) {
            res.json({msg: "Algum erro ocorreu"});
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

            const user = await User.findById(req.params.userId);
            if (!user) {
                return res.send("invalid link or expired");
            }

            const token = await Token.findOne({
                userId: user._id,
                token: req.params.token,
            });
            if (!token) {
                return res.send("Invalid link or expired");
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            
            User.findOneAndUpdate({_id: user}, {password: passwordHash}, (updateErr) => {
                if(updateErr) {
                    return res.json({msg: 'Erro ao alterar a senha'})
                } else {

                    res.status(201).json({msg: "Senha alterada com sucesso!"});
                }
            })  
            await token.delete();          
        } catch (error) {
            res.json({msg: "An error occured"});
        }
    },

    //UPLOAD PROFILE
    async uploadProfile(req, res) {
        const {user} = req
        if(!user) {
            return res.json({msg: "Acesso não autorizado"})
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${user._id}_profile`,
                width: 500,
                height: 500,
                crop: 'fill'
            })
            await User.findByIdAndUpdate(user._id, {avatar: result.secure_url})
            res.json({msg: 'imagem alterada com sucesso'})
        } catch (error) {
            res.json({msg: 'server error, try again'})
        }
    },
};