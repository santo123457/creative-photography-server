const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const fs = require('fs-extra');
const fileUpload= require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fp9q3.mongodb.net/creative-photogrphy?retryWrites=true&w=majority`;
const app = express();
const port = 4000;
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('Orders'));
app.use(fileUpload())


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.connect(err => {
  const orderCollection = client.db("creative-photography").collection("orders");
  const reviewCollection = client.db("creative-photography").collection("reviews");
  const serviceCollection = client.db("creative-photography").collection("services");
  const adminCollection = client.db("creative-photography").collection("admins");




  app.post('/addOrder', (req, res) => {
    const Order = req.body;
      orderCollection.insertOne(Order)
      .then(result=>{
        console.log("data added Successfully");
      })   
    
  })

  app.get('/orders', (req, res) => {
    const email = req.body.email;
    orderCollection.find({
        email: email
      })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })


  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const serviceTitle = req.body.serviceTitle;
    const description = req.body.description;
    const serviceName = req.body.serviceName;
    const filePath = `${__dirname}/services/${file.name}`;
    file.mv(filePath,err=>{
      if(err){
        console.log(err);
        res.status(500).send({msg:"Failed to Upload image"})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image ={
        contentType: req.files.file.mimetype,
        size : req.files.file.size,
        img : Buffer(encImg, 'base64')
      };
      serviceCollection.insertOne({serviceTitle,description,image,serviceName})
      .then(result=>{
        fs.remove(filePath,error=>{
          if(error){
            console.log(error)
            res.status(500).send({msg:"Failed to Upload an image"})
          }
            res.send(result);
        })
      })   
    })
  })


  app.get('/services', (req, res) => {
    const email =  req.query.email
    serviceCollection.find({
        email: email
      })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })

  app.get('/allOrders', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  

     app.post("/addReviews", (req, res) => {
    const Review = req.body;
    reviewCollection.insertOne(Review)
      .then(result => {
        console.log("data added Successfully");

      })
  })




    app.get('/reviews', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // app.post("/addAdmin", (req, res) => {
  //   const Product = req.body;
  //   adminCollection.insertOne(Product)
  //     .then(result => {
  //       console.log("data added Successfully");

  //     })
  // })

  // app.post('/isAdmin',(req,res)=>{
  //   const email = req.body.email;
  //   adminCollection.find({ email: email})
  //   .toArray((err,documents)=>{
  //     res.send(documents);
  //   })
  // })


  app.get('/', (req, res) => {

    res.send('welcome to new database')

  })
});


app.listen(process.env.PORT || port);