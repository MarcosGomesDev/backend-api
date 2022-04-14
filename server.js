require('dotenv').config();

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const userRoutes = require('./src/routes/userRoutes')
const sellerRoutes = require('./src/routes/sellerRoutes')
const productRoutes = require('./src/routes/productRoutes')
const admRoutes = require('./src/routes/admRoutes')

mongoose.connect(process.env.URL)
    .then(() => {
        console.log('our db is connected')
    })
    .catch(err => console.log('not connect our db', err))

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(userRoutes)
app.use(sellerRoutes)
app.use(productRoutes)
app.use(admRoutes)

app.listen(3003, (req, res) => {
    console.log('Server on')
})