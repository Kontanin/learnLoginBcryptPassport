if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}




const express =require('express');
const flash=require('express-flash');
const bcrypt=require('bcrypt');
const session = require('express-session')
const path = require('path');
const passport = require('passport');
const methodOverride = require('method-override');

const initializePassport=require('./passport-config')
var viewPath = path.join(__dirname, '/views');


const app = express()
const port=3000;



initializePassport(
    passport,
    email=>user.find(user=>user.email === email),
    id=>user.find(user=>user.id===id)
)


const user=[]

app.set('views', viewPath);
app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized:false
}))


app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



//get 
app.get('/',checkAuthenticated,(req,res)=>{
    res.render('index',{name:req.user.name})
})


app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login')
})

app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})



//post/register
app.post('/register',checkNotAuthenticated,async (req,res)=>{
    try{
        const hashedpassword= await bcrypt.hash(req.body.password,10)
        user.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashedpassword
            
        })
        res.redirect('/login')
    } catch{
        res.redirect('/register')
    }
    console.log(user,"user")
})

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}))

app.delete('/logout',(req,res)=>{

    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
      });
})




function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
    
function checkNotAuthenticated (req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}



app.listen(port,console.log(`start server${port}`))

// ต้องแก้เปิดมาlog inแล้วไม่error login passแล้วกลับไป หน้าlogin ไม่ได้