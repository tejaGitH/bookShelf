require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors= require("cors");
const bodyParser= require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require("passport");
// const expressJwt = require('jsonwebtoken');

//const protectedRoute = expressJwt({ secret: 'your_jwt_secret', algorithms: ['HS256'] });
// Usage example
// app.get('/protected', protectedRoute, (req, res) => {
//     res.send('This is a protected route');
// });

const verifyToken = require("./middleware/verifyToken");
//const verifyToken = require("./middleware/auth");
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require('./routes/bookRoutes');
const friendshipRoutes = require("./routes/friendshipRoutes");



const app = express();
const PORT = 3000;
const dbURI= process.env.MONGO_URI;


mongoose.connect(dbURI).then(()=>{
    console.log("connected to db")
},(err)=>{
    console.log("something Occured error"+err);
})

app.use(express.json());
// app.use(cors({
//     origin:'http://localhost:3001',
//     credentials: true
// }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(passport.initialize());
//loading passport starategies by passing passport instatnce
require("./passport")(passport);


//public routes
app.use('/users',userRoutes);
//app.use('/api/books', passport.authenticate('jwt', { session: false }), bookRoutes);

//protected routes
app.use('/api/books',verifyToken,bookRoutes);
//app.use('/api', verifyToken,friendshipRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(PORT,(req,res)=>{
    console.log(`server on ${PORT}`)
});
