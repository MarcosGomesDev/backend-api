require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('our db is connected')
    }).catch(err => console.log('not connect our db', err))

const routes = require('./src/routes/routes');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(routes);

app.listen(3003, function () {
    console.log("Servidor iniciou com sucesso")
});