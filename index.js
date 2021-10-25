const express = require('express')
const { body, validationResult } = require('express-validator');
var expressSession=require('express-session');
const exhbs = require('express-handlebars')
const port = process.env.PORT || 3000
const app =express();
//connect mongoose
const mongoose = require("mongoose");
const path = require('path')
const {log} = require("nodemon/lib/utils");
const cors = require("cors");
app.use(expressSession({secret:'max',saveUninitialized:false,resave:false}));
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
//model login
var loginSchema=new mongoose.Schema({
    username:String,
    password:String
})
//model device
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
//model doctor
var DOCTORSchema = new mongoose.Schema({
    id:Number,
    name:String,
    gender:String,
    username:String,
    password:String,
    state:Boolean,
});
//model patient
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
//model admin web manage
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

var corsOptions = {
    origin: "http://localhost:3000"
};


console.log(__dirname)

//get login
app.get('/login', (req, res)=> {
    res.render('login', {
        success: req.session.success,
        errors: req.session.errors
    });

    req.session.errors = null;
})
// get info all device
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
// get infomation detail patient
// app.get("/profile", (req, res) => {
//     var modelPatient = db.model('data-patients', PATIENTSchema);
//     var modelDevice = db.model('data-devices', DEVICESchema);
//
//     var dataPatient = modelPatient.find({key_device:"device01"})
//     var dataDevice=modelDevice.find({key_device:"device01"});
//
//     //set data chi tiết bệnh nhân
//     dataPatient.exec((err,data) => {
//         if (err) throw err;
//         console.log("data patient: ", data.map(aa => aa.toJSON()))
//         res.render('profile', {
//             patient: data.map(aa => aa.toJSON())
//         })
//     })
//     //set data lịch sử
//     dataDevice.exec((err,data)=>{
//         if (err) throw err;
//         console.log("data device: ", data.map(aa => aa.toJSON()))
//         res.render('profile', {
//                 device: data.map(aa => aa.toJSON())
//             })
//     })
//
// });

app.get('/profile',(req, res)=>{
    PATIENT.find({key_device:'device01'},(err, data)=>{
        if (err){
            console.log('err patient:', err);
        }else {
            DEVICE.find({key_device:'device01'},(err2, data2)=>{
                if (err){
                    console.log('err device:', err);
                }else{
                    console.log('data patient:',data);
                    console.log('data device:', data2);
                    res.render('profile',{patient:data, device:data2})
                }
            })
        }
    })

})

app.get('/update-patient',(req, res)=>{
    res.render('infoPatient');
})
//get list doctor
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
//check login
app.post('/login',
    [
        body('username','Tên đăng nhập không được để trống')
            .not()
            .isEmpty(),
        body('password', 'Mật khẩu không được để trống')
            .not()
            .isEmpty(),
    ],
    (req, res)=> {
    var username =  req.body.username;
    var password = req.body.password;
    var errors = validationResult(req).array();
        if (errors.length>0) {
            console.log(errors)
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/login');
        }
       else {
            req.session.success = true;
            var model = db.model('data-logins', USERSchema);
            model.findOne({username: username, password: password}, (err, user) =>{
                if (err){
                    return console.log("err login: ", err);
                }
                if(!user){
                    errors.push(
                            {
                                value: '',
                                msg: 'Tên đăng nhập hoặc mật khẩu không chính xác',
                                param: 'username',
                                location: 'body'
                            },
                    )
                    console.log(errors)
                    req.session.errors = errors;
                    req.session.success = false;
                    res.redirect('/login');
                    //  res.status(400).json({'errr 400':'err'});
                }
                // res.status(200).json({'mess':'success'})
                if(user!=null){
                    res.redirect('/list-patients');
                }
            })
        }


});
// get list patient
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
//check login web manage
// app.post('/login', [
//     body('username', 'Email is required')
//         .isEmail(),
//     body('password', 'Password is requried')
//         .isEmail(),
//        ],
// (req,res)=>{
//     const username = req.body.username;
//     const password = req.body.password;
//     const model = db.model('data-login', loginSchema);
//     var errors = validationResult(req).array();
//         // if (!errors.isEmpty()) {
//         //         // req.errors = errors;
//         //         // req.success = false;
//         //         // res.redirect('/list-patients');
//         // }
//     if (errors) {
//         req.session.errors = errors;
//         req.session.success = false;
//         res.redirect('/login');
//     } else {
//         req.session.success = true;
//         model.findOne({username:username,password:password},function (err,user) {
//             if(err){
//                 console.log(err);
//                 return res.status(500).send();
//             }
//             if(!user){
//                 res.status(404).send();
//             }
//
//             return res.redirect('/list-patients')
//             // res.status(200).send(user);
//
//         });
//     }
//
// })
app.get('/add-patient',(req, res)=>{
    res.render('addPatient');
})
app.post('/add-patient', (req, res)=>{
    PATIENT({
        id:req.body.id,
        name: req.body.name,
        username:req.body.username,
        password: req.body.password,
        age:req.body.age,
        birth_day:req.body.birth_day,
        phone:req.body.phone,
        number_room:req.body.number_room,
        key_device:req.body.key_device
    }).save((err) =>{
        if (err){
            console.log('Thêm bệnh nhân thất bại:', err);
        }
        res.render('addPatient');
        console.log('Thành công, user: ', req.body);
    })
})

// //update
app.get('/:key',(req,res)=>{
    PATIENT.findById(req.params.key,(err, data)=>{
        if(!err){
            res.render('infoPatient',{
                patient:data.toJSON(),
            })
        }
    })
})
app.post('/update-patient',(req,res)=>{
    PATIENT.findOneAndUpdate({_id:req.body.key},req.body,{new : true},( err, doc)=>{
        if(!err){
            res.render('infoPatient');
            console.log("update success");
        }else {
            // res.redirect('infoPatient');
            console.log(err);
        }
    })
})

app.get('/delete/:key', async (req, res) =>{
    try{
        const patient = await PATIENT.findByIdAndDelete(req.params.key, req.body);
        if (!patient){
            res.status(400).send('Không tìm thấy bệnh nhân');
        }else {
            // res.status(200).send();
            res.redirect('list-patients');
        }
    }catch (e){
        res.status(500).send(e);
    }
})


app.listen(port,()=>{
    console.log('listening port 3000')
})