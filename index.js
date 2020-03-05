const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const config = require('./config.json');
const product = require('./products.json');
const dbProduct = require('./models/products.js');
const Product = require('./models/userProduct.js');

const port = 3000;

// const mongodbURI = 'mongodb+srv://UnicornSparklePrincess:magichorse@unicornsparkleprincess-p1z3y.mongodb.net/shop?retryWrites=true&w=majority';
const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_NAME}.mongodb.net/test?retryWrites=true&w=majority`;


mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB connected!'))
    .catch(err => {
        console.log(`DBConnectionError: ${err.message}`);
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('We are connected to mongo db');
});
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/allProducts', (req, res) => {
    res.json(product);
});

app.get('/products/p=:id', (req, res) => {
    const idParam = req.params.id;

    for (let i = 0; i < product.length; i++) {

        if (idParam.toString() === product[i].id.toString()) {
            res.json(product[i]);
        }
    }
});

app.post('/registerProduct', (req, res) => {

    Product.findOne({ productName: req.body.productName }, (err, productResult) => {
        if (productResult) {
            res.send('Product name already taken');

        } else {
            const product = new Product({
                _id: new mongoose.Types.ObjectId,
                productName: req.body.productName,
                productPrice: req.body.productPrice
               
            });
            product.save().then(result => {
                res.send(result);
            }).catch(err => res.send(err));
        }

    })
});

// app.get('/allUsers', (req,res)=>{
//     User.find().then(result =>{
//         res.send(result);
//     })
// });

app.post('/findProduct', (req,res)=>{
  Product.findOne({productName:req.body.productName},(err,productResult)=>{
    if (productResult){
    //   if (bcryptjs.compareSync(req.body.password, userResult.password)){
        res.send(productResult);
      } else {
        res.send('Product not found');
    //   }//inner if
    // } else {
    //    res.send('user not found. Please register');
    }//outer if
  });//findOne
});//post



app.listen(port, () => console.log(`Mongodb app listening on port ${port}!`))