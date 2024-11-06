const jwt = require("jsonwebtoken");

const verifyToken=(req,res,next)=>{
    // if (req.path === '/api/login' || req.path === '/api/signup') {
    //     return next();
    // }
    const authHeader = req.headers['authorization'];
    console.log("authHeader",authHeader);
    if (!authHeader) {
      return res.status(403).json({ message: "Access Denied, No token Provided" });
    }
    
    const token=authHeader && authHeader.split(' ')[1];//extracting token from bearer header 
    console.log("authorization token:",token);
    if(!token){
        return res.status(403).json({message:"Access Denied, No token Provided"});
    }
    // const bearerToken= token.split(' ')[1];
    jwt.verify(token, 'teja',(err, decoded)=>{
        console.log(token);
        console.log(JSON.stringify(decoded)) ;
               //console.log(decoded);
        // if(err){
        //     console.log("decoded token:",decoded);
        //     return res.status(400).json({message:"invalid token",err});
        // }
      //   if (err) {
      //     console.log("Token verification error:", err);
      //     return res.status(401).json({ message: 'Invalid token' });
      // }
      console.log("Decoded token:", decoded);
        if (err) {
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ message: 'Token expired' });
            } else if (err.name === 'JsonWebTokenError') {
              return res.status(401).json({ message: 'Invalid token' });
            } else {
              return res.status(500).json({ message: 'Token verification failed', err });
            }
            console.log(err);
          }
          console.log("decoded token:",decoded);  
          req.userId = decoded.id;
          next();//call to next( )allows the request to process next middleware  
    })
}
module.exports = verifyToken;