const express = require('express')
const exhbs = require('express-handlebars')
const port = process.env.PORT || 3456
const app =express()

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.engine('hbs',exhbs({
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine','hbs')

app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/index',(req,res)=>{
    res.render('index')
})

app.listen(port,()=>{
    console.log('listening port 3456')
})