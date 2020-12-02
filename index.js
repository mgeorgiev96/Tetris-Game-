
const express = require('express')
const app = express()
const PORT  = process.env.PORT || 5000
const passport = require('passport')
const passportSetup = require('./config/passport-setup')
const basicRouter = require('./routes/basic-routes')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const path = require('path')

mongoose.connect(process.env.MONGO_DB,{ useUnifiedTopology: true , useNewUrlParser: true } )

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.set('view engine', 'ejs')


app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
}))

app.use(passport.initialize())
app.use(passport.session())


app.use('/api',basicRouter)


app.get('/',(req,res)=>{
    res.render('login')
})
app.get('/error',(req,res)=>{
    res.render('error')
})
app.get('/not-authorized',(req,res)=>{
    res.render('missing')
})
app.use(express.static(path.join(__dirname,'/public')))

const userAuth = (req,res,next)=>{
    if(!req.user && !req.session.user){
        res.redirect('/')
    }else{
        next()
    }
}

app.get('/profile',userAuth,(req,res)=>{
    res.sendFile(path.join(__dirname,'public/index.html'))
})


app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`))