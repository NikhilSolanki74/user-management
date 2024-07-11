require('dotenv').config()
let jwt = require('jsonwebtoken')
let userModel = require('../model/userModel')


let Auth2 =async (req,res,next)=>{
  try {
    

if(req.headers['cookie']){    


    let {email} = req.body
    let data = await userModel.findOne({email:email})
      // let token =await req.headers['cookie']
      let token = req.cookies['token']
      // console.log("req",token)
  // token = token.split('=')[1]
 if(!data){
  return res.render('login',{msg:'Email not Exists', icon:'error'})
 }
     
      await jwt.verify(token ,process.env.JWTSECRET, (err,decode)=>{
        if(decode && data ){
         
         
        if(decode.id != data._id){
           console.log('condition 111 jwt accepted' )
           return next()
          }
        if(data.status === 0){
          if(data.activeStatus === 1){
            console.log('condition 112 if loger user')

           return res.redirect('/userRoute')
          }else{
          return res.redirect('/login')
          }
          
         }else if(data.status === 1 ){
           
          // console.log(totalUser);
          if(data.activeStatus === 1){
            console.log('condition 113 if loger admin')
        return res.redirect('/adminRoute')
          }else{
         return res.redirect('/login')
          } 
        }
        
       }else if(err){
      
        console.log("condition 114 not verified jwt")
       return next()
       }


      })}else{
       console.log('condition 115 bypass')
      next();
     }
  } catch (error) {
    console.log(error);
    return res.redirect('/login')
  }
}

module.exports = Auth2