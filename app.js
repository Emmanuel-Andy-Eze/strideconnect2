const express = require('express')
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const path = require('path');
const passport = require('passport')
const session = require('express-session')
const connectDb = require('./config/db')
const methodOverride = require('method-override')

const indexRoute = require('./routes/index')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/users')
const articleRoute = require('./routes/articles')

//Load Config
dotenv.config({ path: './config/config.env' })

//Passport Config
require('./config/passport')(passport)

//ConnectDB
connectDb()

//Logging
app.use(morgan('dev'))


//View engine
app.set('view engine', 'ejs')

//Public Folder
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
    extended: true
}));

app.use(methodOverride('_method'))

//Sessions
app.use(session({
  secret: 'chexy emma',
  resave: false,
    saveUninitialized: false
}))

app.use(express.json());
//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Routes
app.use('/', indexRoute)
app.use('/auth', authRoute)
app.use('/users', userRoute)
app.use('/articles', articleRoute)

// app.get('/', (req, res) => {
//     res.send('Hello World')
// })

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode in port: ${PORT}`)
})