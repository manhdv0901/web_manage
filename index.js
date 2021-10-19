const express = require('express')
const exhbs = require('express-handlebars')
const port = process.env.PORT || 3456
const app =express()

const path = require('path')
const {log} = require("nodemon/lib/utils");
app.use(express.static(path.join(__dirname, 'public')))

app.engine('hbs',exhbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine','hbs')
app.set('views',path.join(__dirname,'/views'))
console.log(__dirname)

app.get('/home',(req,res)=>{
    res.render('home')
});

app.get('',(req,res)=>{
    res.render('index')
});

app.get('/index',(req,res)=>{
    res.render('index')
});

app.get('/login',(req,res)=>{
    res.render('login')
});

app.get('/profile',(req,res)=>{
    res.render('profile')
});

app.get('/register',(req,res)=>{
    res.render('register')
});

app.get('/table',(req,res)=>{
    res.render('table')
});
// app.get('/login',(req,res)=>{
//     res.render('login')
// });

app.listen(port,()=>{
    console.log('listening port 3456')
})