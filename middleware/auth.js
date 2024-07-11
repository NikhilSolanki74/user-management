let jwt = require('jsonwebtoken')
require('dotenv').config()
const Auth= async (req,res,next)=>{
   try{
      
      
      // let token = req.headers['cookie'];
      let token = req.cookies['token'];

      // token = token.split('=')[1]
     //  console.log('this is a token' , token , 'thsi is a req.header' , req.headers)
       if(!token){
        console.log("token not available")
         return res.redirect('/login')
       }
 
  
       jwt.verify(token ,process.env.JWTSECRET , (err,decode)=>{
          if(err){
             console.log('token expired with time limit')
             console.log(err)
           return res.redirect('/login')
  
           }else{
            console.log('condition 555' , "req.body")
              req.body.id = decode.id

              console.log('user verified', "decode")
             return next()
           }
       } )
   }catch(err){
      console.log(err)
   return res.status(400).redirect("/login")
   }
}

module.exports = Auth