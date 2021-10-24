const express = require('express')
const exhbs = require('express-handlebars')
const port = process.env.PORT || 3000
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
var myDataSpO2 =[];

//config mongodb
const DATABASE_URL ="mongodb+srv://sonhandsome01:sonhandsome01@test-data-datn.fwejn.mongodb.net/data-project?retryWrites=true&w=majority";
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
// var DHT11Schema = new mongoose.Schema({
//     key_device:{type:String, default:"device001"},
//
//     heart : Number,
//     spO2: Number,
//     temp:Number,
//     warnn: Number,
//     real_time: {type:Date, default: Date.now()}
// });

var DEVICESchema = new mongoose.Schema({
    id:Number,
    key_device:String,
    heart:[
        {value: Number,
            real_time : Date}
    ],
    spO2: [
        {value:Number,
            real_time :Date}
    ],
    temp: [
        {value:Number,
            real_time :Date}
    ],
})

var DataSenSorUserSchema = new mongoose.Schema({
    id:Number,
    key_device:String,
    spO2:Array,
    temp:Array,
    heart_beat:Array
});

var DOCTORSchema = new mongoose.Schema({
    id:Number,
    name:String,
    gender:String,
    username:String,
    password:String,
    state:Boolean,
});

var UserSchema = new mongoose.Schema({
    id:Number,
    name:String,
    username:String,
    password:String,
    age:Number,
    birth_day:String,
    number_room:Number,
    key_device:String,
    phone:String,
})
var PATIENTSchema = new mongoose.Schema({
    id:Number,
    name: String,
    username:String,
    password: String,
    age:Number,
    birth_day:String,
    phone:Number,
    number_room:Number,
    key_device:String
})
var USERSchema = new mongoose.Schema({
    username : String,
    password: String,
})
//create collection mongodb
var DEVICE = mongoose.model("data-devices", DEVICESchema);
var DOCTORS = mongoose.model('data-doctors', DOCTORSchema);
var PATIENT = mongoose.model('data-patients', PATIENTSchema);
var USER = mongoose.model('data-logins', USERSchema);


app.post("/add-device", (req,res) =>{
    console.log("Received create dht11 data request post dht11");
    //get data request
    console.log("heart: ",req.query.heart);
    myDataHea.push(req.query.heart);
    console.log("value: ",myDataHea);

    console.log("spO2: ",req.query.spO2);
    myDataSpO2.push(req.query.spO2);
    console.log("value: ",myDataSpO2);

    console.log("temp:",req.query.temp);
    myDataTem.push(req.query.temp);
    console.log("value: ",myDataTem);
    var newDEVICE = DEVICE({
        key_device:'device04',
        heart:
            {
                value: Number(req.query.heart),
                real_time: new Date(),
            }
        ,
        spO2:
            {
                value:Number(req.query.spO2),
                real_time: new Date(),
            }
        ,
        temp:
            {
                value: Number(req.query.temp),
                real_time: new Date(),
            }
        ,

    });
    console.log("data post req: ",req.query);

    //insert data
    // db.collection("data-devices").insertOne(newDEVICE,(err,result)=> {
    //     if (err) throw  err;
    //     console.log("Thêm thành công");
    //     console.log(result);
    // });


    // update data
    var oldValue={key_device:"device04"};
    var newValue={
        $push: {
            heart:
                {
                    value: Number(req.query.heart),
                    real_time: new Date(),
                }
            ,
            spO2:
                {
                    value: Number(req.query.spO2),
                    real_time: new Date(),
                }
            ,
            temp:
                {
                    value: Number(req.query.temp),
                    real_time: new Date(),
                }
            ,
        }

    };

    //update
    var model = db.collection("data-devices");
    model.updateOne(oldValue,newValue,(err,obj)=>{
        if(err) throw  err;
        if(obj.length!=0) console.log("Cập nhật thành công");

    });
    res.send("data sensor succesfully");

});



app.set('view engine','hbs')
app.set('views',path.join(__dirname,'/views'))
console.log(__dirname)

app.get('/home',(req,res)=>{
    res.render('home')
});

app.get('/register',(req,res)=>{
    res.render('register')
});

app.get('/table',(req,res)=>{
    res.render('addPatient')
});

app.get("/list",(req, res) => {
    var model = db.model('data-devices', DEVICESchema);
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
    });
app.get("/profile", (req, res) => {
    var modelPatient = db.model('data-patients', PATIENTSchema);
    var modelDevice = db.model('data-devices', DEVICESchema);

    var dataPatient = modelPatient.find({key_device:"device02", id:1});
    var dataDevice=modelDevice.find({});
    //set data lịch sử
    dataDevice.exec((err,data)=>{
        if (err) throw err;
        console.log("data device: ", data.map(aa => aa.toJSON()))
        res.render('profile', {
                device: data.map(aa => aa.toJSON())
            })
    })
    //set data chi tiết bệnh nhân
    dataPatient.exec((err,data) => {
        if (err) throw err;
        console.log("data patient: ", data.map(aa => aa.toJSON()))
        res.render('profile', {
            patient: data.map(aa => aa.toJSON())
        })
    })
});

app.get("/list-doctors", (req, res) => {
    var model = db.model('data-doctors', DOCTORSchema);
    var methodFind = model.find({});
    methodFind.exec((err,data) => {
        if (err) throw err;
        console.log("ham ham: ", data.map(aa => aa.toJSON()))
        res.render('listDoctor', {
            docs: data.map(aa => aa.toJSON())
        })
    })
});
app.post('/login', (req, res)=> {
    var username =  req.body.username;
    var password = req.body.password;

    var model = db.model('data-logins', USERSchema);
    model.findOne({username: username, password: password}, (err, user) =>{
        if (err){
            console.log("err login: ", err);
            res.status(500).json({'err 500':'err'});
        }
        if(!user){
             res.status(400).json({'errr 400':'err'});
        }
         res.status(200).json({'mess':'success'})
    })

});

app.get("/list-patients", (req, res) => {
    var model = db.model('data-patients', PATIENTSchema);
    var methodFind = model.find({});
    methodFind.exec((err,data) => {
        if (err) throw err;
        console.log("ham ham: ", data.map(aa => aa.toJSON()))
        res.render('listPatients', {
            docs: data.map(aa => aa.toJSON())
        })
    })
});

app.listen(port,()=>{
    console.log('listening port 3000')
})