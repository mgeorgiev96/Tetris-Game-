const router = require('express').Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/model')

router.get('/logout',(req,res)=>{
    req.logout()
    req.session.user = null
    res.redirect("/")
})


router.get('/info',(req,res)=>{
    if(!req.user){
        res.json(req.session.user)
    }else{
        res.json(req.user)
    }
})


router.post('/scores',(req,res)=>{
    User.update({username:req.body.username},{
        $push: {scores: parseInt(req.body.current)}
    }).then(()=>{
        User.findOne({username:req.body.username}).then(user=>{
            if(req.user){
                req.user = user
            }else{
                req.session.user = user
            }
        }).then(()=>{
            if(req.user){
                res.json(req.user)
            }else{
                res.json(req.session.user)
            }
        })
    }).catch(err=>console.log(err))
})

router.get('/signup',(req,res)=>{
    res.render('signup')
})

router.post('/signup/user',(req,res)=>{
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        User.findOne({username:req.body.username}).then(user=>{
            if(user){
                res.redirect('/not-authorized')
            }else{
                new User({
                    username: req.body.username,
                    password: hash,
                    thumbnail: 'n/a',
                    name: req.body.name,
                    scores: []
                }).save().then(user=>res.redirect('/'))
            }
        }).catch(err=>console.log(err))
    })
})



router.post('/login',(req,res)=>{
    User.findOne({username:req.body.username}).then(user=>{
        if(user){
            bcrypt.compare(req.body.password,user.password,(err,result)=>{
                if(result){
                    req.logout()
                    req.session.user = {
                        username: user.username,
                        name: user.name,
                        thumbnail: user.thumbnail,
                        scores: user.scores
                    }
                    res.redirect('/')
                }else{
                    res.redirect('/error')
                }
            })
        }else{
            res.redirect('/error')
        }
    }).catch(err=>console.log(err))
})


router.get('/google',passport.authenticate('google',{
    scope: ['https://www.googleapis.com/auth/plus.login',"email"],
    prompt: 'select_account'
}))

router.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
    req.session.user = null
    res.redirect('/')
})
module.exports = router