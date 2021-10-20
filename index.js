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
    extname: '.hbs'
    }))

//mang nhan data tu thiet bi
var myDataTem = [];
var myDataHea=[];
var myDataSpo2 =[];
var myDataButton= [];

//config mongodb
const DATABASE_URL ="mongodb+srv://admin:admin@cluster0.zhsjs.mongodb.net/devices";
const DATABASE_CONNECT_OPTION  = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
//connect mongoose
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
    id: Number,
    id_device:{type:String, default:"device01"},
    temperature:
        [{
            data: Date,
            value: Number
        }]
    ,
    heart :
        [{
            data: Date,
            value: Number
        }]
    ,
    spo2:
        [{
            data: Date,
            value: Number
        }]
    ,
    button:
        [{
            id: Number,
            data: Date,
            value: Number
        }]
});

//create collection mongodb
var DHT11 = mongoose.model("data-devciecs", DHT11Schema);

app.post("/data", (req,res) =>{
    console.log("Received create dht11 data request post dht11");
    //get data request
    console.log("temp:",req.query.temperature);
    myDataTem.push(req.query.temperature);
    console.log("value: ",myDataTem);

    console.log("hum: ",req.query.humidity);
    myDataHea.push(req.query.heart);
    console.log("value: ",myDataHea);

    console.log("spo2: ",req.query.spo2);
    myDataSpo2.push(req.query.spo2);
    console.log("value: ",myDataSpo2);

    console.log("button: ",req.query.button);
    myDataButton.push(req.query.button);
    console.log("value: ",myDataButton);
    var newDHT11 = DHT11({
        id_device:'device01',
        temperature:
            {
                id: Number,
                data: new Date(),
                value: req.query.temperature,
            }
        ,
        heart:
            {
                id: Number,
                data: new Date(),
                value: req.query.heart,
            }
        ,
        spo2:
            {
                id: Number,
                data: new Date(),
                value: req.query.spo2,
            }
        ,
        button:
            {

                data: new Date(),
                value: req.query.button,
            }

    });
    console.log("data post req: ",req.body);

    // insert data
    // db.collection("data-devices").insertOne(newDHT11,(err,result)=> {
    //     if (err) throw  err;
    //     console.log("Thêm thành công");
    //     console.log(result);
    // });


    // update data
    var oldValue={id_device:"device01"};
    var newValue={
        $push: {
            temperature:
                {
                    id: Number,
                    data: new Date(),
                    value: req.query.temperature,
                }
            ,
            heart:
                {
                    id: Number,
                    data: new Date(),
                    // data:Date.now(),
                    value: req.query.heart,
                }
            ,
            spo2:
                {
                    id: Number,
                    data: new Date(),
                    value: req.query.spo2,

                }
            ,
            button:
                {
                    id: Number,
                    data:new Date(),
                    value: req.query.button,
                }

        }

    };

    db.collection("data-devices").updateOne(oldValue,newValue,(err,obj)=>{
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

app.get('/table2',async (req,res)=>{
    // mongoose.model("device", DHT11Schema).find({},(err, array) => {
    //     if (err) throw  err;
    //     res.json(array);
    const  docs = await DHT11.find({});
            docs.map(doc => doc.toJSON());
            console.log("{{{{", docs)
})

app.get("/data2",(req,res) => {
        console.log("request create data");
        db.collection("device").find({},(err, array) => {
            if (err) {
                console.log("find error");
                console.log("[[[:",)
            }
            console.log("lấy dữ liệu thành công ", array);
           res.send(array);
            // res.json(array);
        })

});

app.get("/list",async (req, res) => {
    var model = db.model('data-devices', DHT11Schema);
    var methodFind = model.find({});
    methodFind.exec((err,data) => {
        if (err) throw err;
        res.render('table_2', {
            ups: data.map(aa => aa.toJSON())
        })
    })
    })
    app.get("/list2", (req, res) => {
        // db.collection('device').findOne({}, (err, array) => {
        //     if (err) {
        //         console.log("find error");
        //     }
        //     console.log("lấy dữ liệu thành công ");
        //     res.send(array);
        //     // res.json(array);
        // })
        const dht = db.model('device', DHT11Schema);
        dht.find({}).then(list => {
            res.render('table_2',{
                ups:list.map( lis => lis.toJSON())
        })})
    })

    // const patients = await DHT11.find({});
    // console.log('::::::', patients);
    // try{
    //     res.send(patients);
    // }catch (e){
    //     res.status(500).send(e);
    // }
    // res.render('table_2');
// })

app.listen(port,()=>{
    console.log('listening port 3456')
})