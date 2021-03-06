const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const config = require('./config.json');
// const product = require('./products.json');
const User = require('./models/user.js');
const Product = require('./models/products.js');

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

// app.get('/allProducts', (req, res) => {
//     res.json(product);
// });

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
                productPrice: req.body.productPrice,
                imageUrl : req.body.imageUrl
               
            });
            product.save().then(result => {
                res.send(result);
            }).catch(err => res.send(err));
        }

    })
});

app.get('/allProducts', (req,res)=>{
    Product.find().then(result =>{
        res.send(result);
    })
});
app.delete('/deleteProduct/:id', (req, res)=>{
    const idParam = req.params.id;
    Product.findOne({_id:idParam}, (err,product)=>{
        if (product){
            Product.deleteOne({_id:idParam}, err=>{
                res.send('Deleted');
            });

        } else {
            res.send('not found');
        }

    }).catch(err => res.send(err));
});

app.patch('/updatedProduct/:id', (req,res)=>{
    const idParam = req.params.id;
    Product.findById(idParam, (err, product)=>{
        const updatedProduct = {
            productName:req.body.name,
            productPrice:req.body.price,
            imageUrl:req.body.imageUrl
        };
        Product.updateOne({_id:idParam}, updatedProduct).then(result=>{
            res.send(result);
        }).catch(err=> res.send('not found'));

    }).catch(err=>res.send('not found'));

});



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



//register user
app.post('/registerUser', (req,res)=>{
    //checking if user is found in the db already
    User.findOne({username:req.body.username},(err,userResult)=>{
  
      if (userResult){
        res.send('username taken already. Please try another one');
      } else{
         const hash = bcryptjs.hashSync(req.body.password); //hash the password
         const user = new User({
           _id : new mongoose.Types.ObjectId,
           username : req.body.username,
           email : req.body.email,
           password :hash
         });
         //save to database and notify the user accordingly
         user.save().then(result =>{
           res.send(result);
         }).catch(err => res.send(err));
      }
  
    })
  
  
  });
  
  //get all user
  app.get('/allUsers', (req,res)=>{
    User.find().then(result =>{
      res.send(result);
    })
  
  });
  
  //login the user
  app.post('/loginUser', (req,res)=>{
    User.findOne({username:req.body.username},(err,userResult)=>{
      if (userResult){
        if (bcryptjs.compareSync(req.body.password, userResult.password)){
          res.send(userResult);
        } else {
          res.send('not authorized');
        }//inner if
      } else {
         res.send('user not found. Please register');
      }//outer if
    });//findOne
  });//post



app.listen(port, () => console.log(`Mongodb app listening on port ${port}!`))