const express = require('express');
const user = require('../Controllers/user');

const routes = express.Router();

routes.get('/', function (req, res) {
    res.json({message: "Bem vindo ao backend mongoDB"})
})

routes.get('/user', user.index)
routes.get('/user/:id', user.details)
routes.delete('/user/:id', user.delete)
routes.put('/user/', user.update)
routes.post('/auth/register', user.register)
routes.post('/auth/login', user.login)

module.exports = routes;