require('dotenv').config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const jwtExpireTime = 24 * 60 * 60 ;

exports.signUp =  async(req,res)=>{ 
    
    const {username, email, password, role} = req.body;
    //const hashedPassword = bcrypt.hash(password,await bcrypt.genSalt(10));
    console.log(req.body);
    try{
      const existingUser = await User.findOne({email});
      if(existingUser){
        return res.status(400).json({
          message: "Email already exists"
        })
      }
      //Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
              // Create a new user
              const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role
            });
    
            // Save the user to the database
            await newUser.save();
            console.log('Registered successfully');
            return res.status(201).json({
                 message: "User registered successfully.Please Login to continue",
                  user: {username: newUser.username, email: newUser.email} });
        } catch (error) {
            console.error("Error during sign up:", error);
            return res.status(500).json({ message: "Error registering user", error });
        }
    };
//      User.findOne({
//         email: req.body.email,
//     }).then((user)=>{
//         if(user){
//             return res.status(400).json({email:"email exists"})
//         }else{
//             const newUser = new User({
//                 username: req.body.username,
//                 email: req.body.email,
//                 password: req.body.password,
//                 role: req.body.role
//             })
//             //hence the password need to be encrypted
//         bcrypt.genSalt(10,(err,salt)=>{
//             if(err){
//                 console.log('ther is an error', err);
//             }else{
//                 bcrypt.hash(newUser.password, salt, (err,hash)=>{
//                     if(err){
//                         console.log('there is an error hash',err);
//                     }else{
//                         newUser.password = hash;
//                         newUser.save().then((user)=>{
//                             console.log('registered successfully');
//                             return res.json(user);
//                         })
//                     }
//                 })
//             }
//         })
//         }

        
        
//     })
//  }

 exports.login = async(req, res) => {
   console.log('welcome to loginUser');
   const jwtExpireTime = 3600;
  //  const email = req.body.email;
  //  const password = req.body.password;
  const {email, password} = req.body;
  try {
    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Create JWT token
    const payload = {
        id: user._id,
        name: user.username,
        role: user.role
    };
    console.log("user._id",user._id);
    console.log(process.env.SECRET_KEY);

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: jwtExpireTime });
    // Set cookie with JWT token (httpOnly for security)
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: jwtExpireTime * 1000 }); // maxAge in milliseconds
    console.log('Login successful', payload);
    console.log(token);
    
    // Return the token and user info
    return res.json({ success: true, user: {...payload,token} });
    // return res.json({
    //   success: true,
    //   user: {
    //       id: user._id,
    //       name: user.username,
    //       role: user.role,
    //       token
    //   }
} catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Error logging in", error });
}
};
 
 
 exports.logout = async(req,res)=>{
    try{
        res.clearCookie('token', {httpOnly: true, secure: process.env.NODE_ENV ==='production'});
        console.log('Logout Successful');
        return res.status(200).json({ success: true, message: 'Logout Successful'});
    }catch(error){
        console.log('Logout failed', error);
        return res.status(500).json({success: false, message:'Error during logout', error});
    }
 }
 



// exports.loginUser = (req,res)=>{
//     console.log('welcome to loginUser'); 
//     const email = req.body.email;
//     const password = req.body.password;
//     User.findOne({email}).then((user)=>{
//         if(!user){
//             res.status(404).json({message:'user not found'});
//         }
//         bcrypt.compare(password, user.password).then((isMatch)=>{
//             if(isMatch){
//                 const payload = {
//                     id: user.id,
//                     name: user.name,
//                    // role: user.role
//                 };
//                 //console.log(user.password)
//                 jwt.sign(payload,
//                          process.env.SECRET_KEY, 
//                          {expiresIn : jwtExpireTime}),
//                          (err,token)=>{
//                            console.log(token)
//                             if(err){
//                                 console.log('there is an error in jwt', err);
//                             }else{
//                                 console.log('login successfull',payload);
//                                 res.json({
//                                     success : true,
//                                     token : `bearer: ${token}`
//                                 })
//                             }

//                          }            }
//         })

//     })

//     }
// exports.registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ email: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
//     const newUser = new User({ name, email, password: hashedPassword, role });

//     await newUser.save();
//     console.log("Registered successfully");
//     return res.json(newUser);
//   } catch (error) {
//     console.error(error);
//     console.log (error);
//     return res.status(500).json({ message: "Error registering user",err: "error" });
//   }
// };

// const jwtExpireTime= '1hr';

// const signUp = async (req,res)=>{
//     try{

//         const {username, email, password} = req.body;
//         console.log("signUp req body",req.body);
//         const existingUser =await User.findOne({email});
//         if(existingUser){
//             res.status(400).json({message:"user exists"});
//         }
//         const hashedPwd= await bcrypt.hash(password,10);
//         const newUser = new User({username, email, password:hashedPwd});
//         await newUser.save().then(()=>{
//             res.status(201).json({message:"user Created"});
//         });
//     }catch(error){
//         console.log("error",error);
//         res.status(400).json({message: error.message});
//     }
// }


// const login = async(req,res)=>{
//     try{
//         const {email,password}= req.body;
//         console.log("hi");
//         // Input validatin
//     if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password required' });
//       }
//         const user = await User.findOne({email});
//         if(!user){
//             return res.status(401).json({message:'Invalid crededentials'});
//         }
//         const isValidPassword = await bcrypt.compare(password,user.password);
//         if(!isValidPassword){
//             return res.status(401).json({message: 'Invalid Crededentials'});
//         }
//         const payload ={
//             id:user._id,
//             name: user.username,
//             role: user.role
//         }
//         const token = jwt.sign(payload, process.env.SECRET_KEY,{expiresIn:'24h'});
//         //set cookies with jwt
//        // res.cookies('token', token,{httpOnly: true});//set cookies for client side access
//         res.status(200).json({token,user: payload});
//     }catch(error){
//         if (error instanceof mongoose.Error) {
//             res.status(500).json({ message: 'Database error' });}
//             else
//         res.status(400).json({message:error.message});
//     }
// }

// module.exports ={ signUp,login};