const express = require('express')
const exhbs = require('express-handlebars')
const port = process.env.PORT || 3456
const app =express();
//connect mongoose
const mongoose = require("mongoose");
const path = require('path')
const {log} = require("nodemon/lib/utils");
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.engine('hbs',exhbs({
    defaultLayout: 'main',
    extname: '.hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }

    }))

//mang nhan data tu thiet bi
var myDataTem = [];
var myDataHea=[];
var myDataSpo2 =[];
var myDataWarn= [];

//config mongodb
const DATABASE_URL ="mongodb+srv://sonhandsome01:sonhandsome01@test-data-datn.fwejn.mongodb.net/test-data-datn?retryWrites=true&w=majority";
const DATABASE_CONNECT_OPTION  = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
// //connect mongoose
mongoose.connect(DATABASE_URL, DATABASE_CONNECT_OPTION);

//check connect mongoose
mongoose.connection.on("connected", function (){
    console.log("connect successful");
})
mongoose.connection.on("disconnected", function (){
    console.log("connect fail");
});

//connect mongoose
var db=mongoose.connection;

//create model data device
var DHT11Schema = new mongoose.Schema({
    key_device:{type:String, default:"device001"},

    heart : Number,
    spO2: Number,
    temp:Number,
    warnn: Number,
    real_time: {type:Date, default: Date.now()}
});

var DOCTORSchema = new mongoose.Schema({
    id:Number,
    name:String,
    username:String,
    password:String,
    state:String,
})

//create collection mongodb
var DHT11 = mongoose.model("device01", DHT11Schema);
var DOCTORS = mongoose.model('doctor', DOCTORSchema);

app.post("/data", (req,res) =>{
    console.log("Received create dht11 data request post dht11");
    //get data request
    console.log("heart: ",req.query.heart);
    myDataHea.push(req.query.heart);
    console.log("value: ",myDataHea);

    console.log("spO2: ",req.query.spO2);
    myDataSpo2.push(req.query.spO2);
    console.log("value: ",myDataSpo2);

    console.log("temp:",req.query.temp);
    myDataTem.push(req.query.temp);
    console.log("value: ",myDataTem);

    console.log("button: ",req.query.warnn);
    myDataWarn.push(req.query.warnn);
    console.log("value: ",myDataWarn);
    var newDHT11 = DHT11({
        key_device:'device001',
        heart: req.query.heart,
        spO2: req.query.spO2,
        temp: req.query.temp,
        warnn: req.query.warnn,
    });
    console.log("data post req: ",req.query);
    newDHT11.save(error => {
        if(!error){
            console.log("insert data devices succes");
            res.status(200).json();
        }else {
            console.log("don't insert data devices ");
            res.status(400).json();
        }
    })
    res.send("data sensor succesfully");

});



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
    res.render('listPatients')
});

app.get("/list",(req, res) => {
    var model = db.model('data-devices', DHT11Schema);
    var methodFind = model.find({});
    methodFind.exec((err,data) => {
        if (err) throw err;
        console.log("ham ham: ", data.map(aa => aa.toJSON()))
        res.render('table_2', {
            ups: data.map(aa => aa.toJSON())
        })
    })
    // console.log("request create data");
    // var model = db.model('data-sensor',DHT11Schema);
    //
    // model.find({},(error,devices)=>{
    //     console.log("ham ham: ",devices)
    //     res.render('table_2',{ups:devices})
    // })
    })
app.get("/list-doctors", (req, res) => {
    var model = db.model('doctor', DOCTORSchema);
    var methodFind = model.find({});
    methodFind.exec((err,data) => {
        if (err) throw err;
        console.log("ham ham: ", data.map(aa => aa.toJSON()))
        res.render('listDoctor', {
            docs: data.map(aa => aa.toJSON())
        })
    })
})
app.listen(port,()=>{
    console.log('listening port 3456')
})