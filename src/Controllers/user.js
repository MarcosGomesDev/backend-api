require('dotenv').config();

const User = require('../Models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    async index(req, res) {
        const user = await User.find({}, {senha: 0})
        return res.json(user)
    },

    // Private Route
    async details (req, res, next) {
        const id = req.params.id
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(" ")[1]

        //Check if user exists
        const user = await User.findById(id, '-senha')

        if(!user) {
            return res.status(404).json({msg: 'Usúario não encontrado'})
        }

        if(!token) {
            return res.status(401).json({msg: 'Acesso negado!'})
        }

        try {
            const secret = process.env.SECRET

            jwt.verify(token, secret)

            next()
            return res.status(200).json({user})

        } catch (error) {
            return res.status(401).json({msg: 'Token inválido!'})
        }

    },

    

    // CREATE USER
    async register(req, res) {
        const {nome, email, senha, confSenha} = req.body

        // Validations
        if(!nome) {
            return res.status(422).json({msg: 'O nome é obrigatório!'})
        }

        if(!email) {
            return res.status(422).json({msg: 'O email é obrigatório!'})
        }

        if(!senha) {
            return res.status(422).json({msg: 'A senha é obrigatório!'})
        }

        if(senha !== confSenha) {
            return res.status(422).json({msg: 'As senhas não correspondem!'})
        }

        // Check if user exists
        const userExist = await User.findOne({email: email})

        if(userExist) {
            return res.status(422).json({msg: 'Por favor utilize outro email!'})
        }

        //Create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(senha, salt)

        //create user
        const user = new User({
            nome,
            email,
            senha: passwordHash
        })
        try {
            await user.save()

            return res.status(201).json({msg: 'Úsuario criado com sucesso!'})
        } catch (error) {
            return res.status(500).json({msg: 'Erro ao criar usuário, tente novamente mais tarde!'})
        }
    },

    // DELETE USER
    async delete(req, res) {
        const _id = req.params.id
        const user = await User.findByIdAndDelete({_id})
        return res.json(user)
    },

    // UPDATE USER
    async update(req, res) {
        const {_id, nome, senha} = req.body

        let dataCreate = {}

        dataCreate = {
            nome, senha
        }

        const user = await User.findByIdAndUpdate({_id}, {new: true})
        return res.json(user)
    },

    // Login user
    async login(req, res) {
        const {email, senha} = req.body

        //Validations
        if(!email) {
            return res.status(422).json({msg: 'O email é obrigatório!'})
        }

        if(!senha) {
            return res.status(422).json({msg: 'A senha é obrigatório!'})
        }
        
        //Check if user exists
        const user = await User.findOne({email: email})

        if(!user) {
            return res.status(404).json({msg: 'Usuário não encontrado!'})
        }

        //Check if password match
        const checkPassword = await bcrypt.compare(senha, user.senha)

        if(!checkPassword) {
            return res.status(404).json({msg: 'Senha inválida!'})
        }

        try {
            const secret = process.env.SECRET

            const token = jwt.sign({
                id: user._id
            }, secret)

            return res.status(200).json({msg: 'Autenticação realizada com sucesso', token})

        } catch (err) {
            return res.status(500).json({msg: 'Erro ao logar usuário, tente novamente mais tarde!'})
        }
    },

    
}