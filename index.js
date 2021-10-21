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

const DATABASE_URL ="mongodb+srv://sonhandsome01:sonhandsome01@test-data-datn.fwejn.mongodb.net/test-data-datn?retryWrites=true&w=majority";
//config mongodb
// const DATABASE_URL ="mongodb+srv://admin:admin@cluster0.zhsjs.mongodb.net/devices";
const DATABASE_CONNECT_OPTION  = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
// //connect mongoose
mongoose.connect(DATABASE_URL, DATABASE_CONNECT_OPTION);


var DHT11Schema = new mongoose.Schema({
    id: Number,
    key_device:String,
    heart:
        [{
            value:Number,
            real_time :  Date
        }],
    spO2:
        [{
            value:Number,
            real_time :  Date
        }]
    ,
    temp:
        [{
            value:Number,
            real_time :  Date
        }],
    warnn:
    [{
        value: Number,
        real_time :  Date
    }]
});
//check connect mongoose
mongoose.connection.on("connected", function (){
    console.log("connect successful");
})
mongoose.connection.on("disconnected", function (){
    console.log("connect fail");
});

//connect mongoose
var db=mongoose.connection;

// //create model data device
// var DHT11Schema = new mongoose.Schema({
//     id: Number,
//     id_device:{type:String, default:"device01"},
//     temperature:
//         [{
//             data: Date,
//             value: Number
//         }]
//     ,
//     heart :
//         [{
//             data: Date,
//             value: Number
//         }]
//     ,
//     spo2:
//         [{
//             data: Date,
//             value: Number
//         }]
//     ,
//     button:
//         [{
//             data: Date,
//             value: Number
//         }]
// });

//create collection mongodb
var DHT11 = mongoose.model("data-sensor", DHT11Schema);

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
        key_device:'device01',
        heart:
            {
                value: req.query.heart,
                real_time: new Date(),
            }
        ,
        spO2:
            {
                value: req.query.spO2,
                real_time: new Date(),
            }
        ,
        temp:
            {
                value: req.query.temp,
                date: new Date(),
            }
        ,
        warnn:
            {
                value: req.query.warnn,
                real_time: new Date(),
            }

    });
    console.log("data post req: ",req.query);

    // insert data
    // db.collection("data-sensor").insertOne(newDHT11,(err,result)=> {
    //     if (err) throw  err;
    //     console.log("Thêm thành công");
    //     console.log(result);
    // });


    // update data
    var oldValue={key_device:"device01"};
    var newValue={
        $push: {
            heart:
                {
                    value: req.query.heart,
                    real_time: new Date(),
                }
            ,
            spO2:
                {
                    value: req.query.spO2,
                    real_time: new Date(),
                }
            ,
            temp:
                {
                    value: req.query.temp,
                    real_time: new Date(),
                }
            ,
            warnn:
                {
                    value: req.query.warnn,
                    real_time: new Date(),
                }

        }

    };

    db.collection("data-sensor").updateOne(oldValue,newValue,(err,obj)=>{
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
app.listen(port,()=>{
    console.log('listening port 3456')
})