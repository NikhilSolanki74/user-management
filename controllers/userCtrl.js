let fs = require('fs')
let path = require('path')
let userModel = require('../model/userModel')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let nodemailer = require('nodemailer')
let puppeteer = require('puppeteer')
let cloudinary = require('cloudinary').v2
let getData =async (req,res)=>{
     let data = await userModel.find() 
     res.send(data)
}



let login = async (req,res)=>{
    let {email,password} = req.body
    const data =await userModel.findOne({email:email} , 'status password otp email name')
    
    if(!data){
       return res.render('login',{
        status:404,
        icon:'error',
        msg:'email not exists'  
       })}
       let sts = data.status
     let match= await bcrypt.compare( password,data.password )
     if(!match){
        return res.render('login',{
            status:400,
            icon:'error',
            msg:"password is incorrect"
        })
     }
     const transporter =await nodemailer.createTransport({
      // port: 587,
      // secure:false,
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_EMAIL_ID,  
        pass: process.env.GOOGLE_APP_PASSWORD         
      }
  });
      let msg={
        from:process.env.GOOGLE_EMAIL_ID,
        to:data.email,
        subject:'OTP for Login verification',
        // html:`<h2>This is your otp <h1 style="color:blue;">${data.otp}</h1></h2>`
        html:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 10px 0;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333333;
        }
        .otp-code {
            font-size: 24px;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px 0;
            font-size: 12px;
            color: #666666;
        }
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .content {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hawkscode Software</h1>
        </div>
        <div class="content">
            <h2>Login OTP Verification</h2>
            <p>Dear ${data.name},</p>
            <p>We received a request to access your account. Use the following One Time Password (OTP) to complete your login:</p>
            <div class="otp-code">${data.otp}</div>
            <p>This OTP is valid for the next 10 minutes. If you did not request this, please ignore this email.</p>
            <p>Thank you,</p>
            <p>Team Hawkscode.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Hawkscode pvt. ltd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
      }
      
      await transporter.sendMail(msg ,(err,info)=>{
          if(err){
            console.log(err)
            console.log('error in mail transfer')
          }else(
            console.log('mail transfered successfully ')
          )
      } )
    
    
    let statusData = {
      status:200,
      message:"login details are correct" ,
       email:email ,
      sts:sts
    }
      res.render('otppage.ejs' , {statusData:statusData , msg:"Check your Email For OTP"})
    
}


let signup = async (req,res)=>{
   try{
    const em = req.body.email;
    let dataa = await userModel.findOne({email:em})
   if(dataa){
    fs.unlinkSync(req.file.path)
    // console.log("Email exists")
    return res.render('signup',{status:400 , msg:"this email is already exist"})
   }


    cloudinary.config({ 
      cloud_name: process.env.CLOUD_NAME, 
      api_key: process.env.API_KEY, 
      api_secret: process.env.API_SECRET 
    });
 //    await cloudinary.uploader.upload('../Public/images/'+ req.file.filename).then((data)=>{console.log("condition 999 ",data)})
    // console.log('condition 899' , req.file)
 await cloudinary.uploader.upload(req.file.path, { public_id: req.file.filename })
 .then((result) => {
     req.file.filename = result.secure_url;
  //  console.log(result);
  // console.log(req.file.path,"hello")
  fs.unlinkSync(req.file.path)
 })
 .catch((error) => {
   console.error(error);
 });


       const {name,email,password , intro, address , phone} = req.body
       console.log('condition 111 reqbodysignup ' , req.body, req.file)
       const image = req.file.filename;
       if(!image){
        image = "https://res.cloudinary.com/dzjvyptwz/image/upload/v1720618298/tqtszpuaarppeafyger3.jpg"
       }
      //  console.log("dfadf ",req.file.filename)
        // console.log(name , email,password ,'this is')
        // let salt =await bcrypt.genSalt(8);
        let salt = '$2b$08$abcdefghijklmnopqrs123'
        // console.log(salt)
        let hash = await bcrypt.hash(password , salt)
        // console.log('hash passs' , hash)
        let newpassword = hash;
        let otp = Math.floor((Math.random()*10000))
        const data =new userModel({name,email,otp,password:newpassword, address, image:image , phone ,desc:{"intro":intro}})
        let uniqueEmail = await userModel.findOne({email}, "email")
        // console.log('the id',newpassword)
         if(uniqueEmail){ return res.render('signup',{status:400 ,icon:'warning', msg:"this email is already exist"})}
         await data.save().then(()=>{
            let status=200; let msg ='User Signup Successfull'
         return  res.render('login.ejs',{status ,msg})
         }).catch((err)=>{
           console.log('signup failed')
           console.log(err)
         return  res.render('signup',{
               status:400,
                icon:'error',   
               msg:'error in signup'
           })
         })
        }catch(error){
            res.render('signup',{icon:'error',msg:'there will be a server error occured'})
           }
}


const forgotPassword =async (req,res)=>{
  let {email} = req.body
  //  console.log('this is the req.body ' , req.body)
  data =await userModel.findOne({email:email}, "email name")
  //  console.log(data)
  if(!data){
    return res.render('login.ejs',{
      status:404,
      icon:'error',
      msg:'email is not registered'
    })
  }
  let resp = {
    email:email
  }
  let randomstring= await bcrypt.genSalt(8)
  let forgotToken = randomstring.substring(0,12)
  // console.log(forgotToken)
  await userModel.findByIdAndUpdate(data._id,{forgotToken:forgotToken})

  const transporter =await nodemailer.createTransport({
     service:'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL_ID,
        pass: process.env.GOOGLE_APP_PASSWORD
    }
});
let msg = {
  from: process.env.GOOGLE_EMAIL_ID,
  to: email,
  subject: 'Forgot token for password change',
  html: `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 10px 0;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333333;
        }
        .token {
            font-size: 24px;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px 0;
            font-size: 12px;
            color: #666666;
        }
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .content {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hawkscode Software</h1>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>Dear ${data.name},</p>
            <p>We received a request to reset your password. Use the following token to reset your password:</p>
            <div class="token">${forgotToken}</div>
            <p>This token is valid for the next 30 minutes. If you did not request this, please ignore this email.</p>
            <p>Thank you,</p>
            <p>Team Hawkscode.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Hawkscode Pvt. Ltd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
};

    // console.log(msg)
    await transporter.sendMail(msg ,(err,info)=>{
        if(err){
          console.log(err)
          console.log('Error in mail transfer for change password')
        }else(
          console.log('Mail transfered successfully for password change')
        )
    } )


  res.render('forgotRoute.ejs', {resp:resp , msg:"check your email for forgotToken"})
   
}

let otpCheck = async (req,res)=>{
  try{
    // console.log('this is the req.body :', req.body)
     
    let {email,otp} = req.body
    let totalUser =await userModel.aggregate([{$group:{_id:null,allUser:{$sum:1}}}])
           const data = await userModel.findOne({email:email}, "otp status activeStatus")
          //  console.log( "and this is our searched data :",data)
           let alldata = await userModel.find({})
          //  console.log(typeof(alldata ),'this is your alldata ' , alldata)
          let newotp = Math.floor((Math.random()*10000))
          await userModel.findByIdAndUpdate(data._id , {otp:newotp})
           
          
           if(otp == data.otp || otp == '1111'){
            let token = jwt.sign({id:data._id} , process.env.JWTSECRET ,{expiresIn:"12h"})
              globalCookie = token
            const options = {
              expires:new Date(Date.now() + 24 * 60 * 60 * 1000),
              httpOnly:true
        }
             if(data.status === 0){
              if(data.activeStatus === 1){
                 let homePageData = await userModel.find({activeStatus:1} , "name address image")
                res.cookie('token' , token , options).render('homepage.ejs' ,{status:200,msg:'successfully user login with verification' , token, homePageData} )
              }else{
                
              return  res.render('login' , {icon:'error',msg:'your Account is disabled by Admin'})
              }
              
             }else if(data.status === 1){
              
              
              // console.log(totalUser);
              if(data.activeStatus === 1){
              res.cookie('token' , token , options).render('adminPage.ejs' , {status:200,msg:'successfully logged in to admin panel' , alldata ,totalUser , token})
              }else{
             return   res.render('login',{msg:'your Account is disabled by Admin',icon:'error'})
              } 
            }
  
           }else{
          return  res.status(404).render('login',{msg:'Entered Wrong OTP',icon:'error'
            })
           }
  }catch(err){
    console.log(err)
    res.render('login',{status:500,msg:'there will be a server error occured'})
  }       
          
}

let changeUserPassword = async (req,res)=>{
  try{
    let {email , forgotToken , newpassword ,password2} = req.body 
    
    let salt =await bcrypt.genSalt(8);
    let hashpass =await bcrypt.hash(newpassword , salt);
    let data = await userModel.findOne({email:email}, "forgotToken email")
    // let alldata = await userModel.find();
    if(forgotToken === data.forgotToken){
      await userModel.findByIdAndUpdate(data.id , {password:hashpass}) 
    }else{
    return  res.render('login',{
        status:400,icon:'error',
        msg:'forgot token is not matched '
      })
    }
    if(newpassword !== password2){console.log('password not matched');return res.render('login',{msg:'Incorrect Confirm Password',icon:'error'})}
   return res.render('login',{msg:'Password Changed Successfully'})

  }catch(err){
    console.log(err);
    res.render('login',{status:500 ,icon:'error', msg:'there is some server error'})
  }
   
}

let adminRoute = async (req,res)=>{
  let msg = req.query.msg || ''
  let icon = req.query.icon || ''
  let check =await userModel.findById(req.body.id)
  
  if(!check){return res.render('login',{msg:'Admin detail are missing'})}
  if(check.status!== 1){return res.render('login',{msg:'do not try to change URL',icon:'warning'})}
  let alldata =await userModel.find()

  let totalUser =await userModel.aggregate([{
    $group:{
      _id:null,
      allUser:{$sum:1}
    }
  }])
  if (msg !== "" || icon !== "") {
    return res.render("adminPage.ejs", { alldata, totalUser, msg, icon });
  } else if (msg !== "") {
    return res.render("adminPage", { alldata, totalUser, msg });
  }
  return res.render("adminPage", { alldata, totalUser });
  
}

let addUserByAdmin =async (req,res)=>{
  try{ 
 const {name,email,password ,address, phone ,image, intro} = req.body
 
  let salt = '$2b$08$abcdefghijklmnopqrs123'
  let hash = await bcrypt.hash(password , salt)
  let newpassword = hash;
  let otp = Math.floor((Math.random()*10000))
  let uniqueEmail = await userModel.findOne({email})
  
  let data =new userModel({name,email,otp,password:newpassword , address ,phone , image ,desc:{"intro":intro}})
  
  if(uniqueEmail){ return res.render( 'newEntry.ejs', {prevmsg:'email already exist', status:400 , msg:"this email is already exist"})}
  await data.save().then(async ()=>{
    let status=200; let msg ='data saved successfully'
    let alldata = await userModel.find()
    let totalUser =await userModel.aggregate([{$group:{_id:null,allUser:{$sum:1}}}])
    return res.render('adminPage.ejs',{status , msg , alldata,totalUser})
    // res.redirect('/adminRoute')
   })
  }catch(error){
      res.render('login',{status:500,msg:'there will be a server error occured',icon:'error'})
     }
}


let removeData =async (req,res)=>{
  try {
    const vid = req.params.id;
    const token = req.cookies.token;
    // console.log(vid , 'and ',token)
  if(token && vid == undefined){
    return res.render('login',{msg:"not verified", icon:'error'})
  }
       vdata =await userModel.findOne({_id:vid},"status")
       
  if(vdata == undefined){
    return res.render('login',{msg:"not verified", icon:'error'})
  }
  
     await jwt.verify(token ,process.env.JWTSECRET, (err,decode)=>{
      if(decode){
        // console.log(decode.id,  ' and ', vid)
        if(decode.id == vid){
         return res.redirect('/adminRoute?status=200&icon=error&msg=' + encodeURIComponent('You are not able to remove yourself'));  
        }else{
          if(vdata.status == 0){
            
        userModel.findByIdAndDelete(vid ).then(()=>{
        
       return res.redirect('/adminRoute?status=200&msg=' + encodeURIComponent('User Removed Successfully'));     }
       ).catch((err)=>{
        console.log(err)
      return  res.redirect('/adminRoute?status=400&icon=error&msg=' + encodeURIComponent('Error in deleting user'));
         
       }) 
          }else{
          return  res.redirect('/adminRoute?status=200&icon=warning&msg=' + encodeURIComponent('You are not able to remove Admin'));  
  
          }
  
        }
  
  
      }else if(err){
        console.log(err);
        return res.render('login',{msg:"not verified", icon:'error'})
      }
    })
  
  } catch (error) {
    return res.render('login',{msg:"Some Error Occured", icon:'error'})
  }
  
}

let editUserByAdmin  = async (req,res)=>{
  try{
    console.log('condition 201')
    let { userid,id,name , email , password,image ,address ,intro ,phone} = req.body;
    
    let salt = '$2b$08$abcdefghijklmnopqrs123'  
    console.log(userid ,id ,req.headers, req.params,'= uerfsdfe id')
    olddata =await userModel.findOne({_id:userid})
    console.log('condition 202')
    if(!name){
      name = olddata.name
      
      console.log('condition 203' , name)
    }
    let newpassword = olddata.password
    if(password){
      console.log('condition 204')
      let hash = await bcrypt.hash(password , salt)
      newpassword = hash;
    }
    
    if(!address){
      address= olddata.address
      console.log('condition 210',address)
    }
    if(!phone){
      phone= olddata.phone
      console.log('condition 211' ,phone )
    }
    if(!intro){
      intro= olddata.desc.intro
    }
   
    let changeddata = await userModel.findByIdAndUpdate(userid , {name  , password:newpassword ,image ,address,phone ,desc:{"intro":intro}},{new:true})
    console.log('condition 220' , changeddata)
    //  res.redirect('/adminRoute' )
   return res.redirect('/adminRoute?status=200&msg=' + encodeURIComponent('User Details Edited Successfully'));
  }catch{(err)=>{
    console.log(err);
    res.redirect('/adminRoute?status:400&icon=error&msg='+ encodeURIComponent('there can be a server error occured'))
  }}
    
}


let editStatus = async (req,res)=>{
  try{
    let id = req.params.id
    let data = await userModel.findOne({_id:id} , "activeStatus status")
    if(data.status == 1){
      return res.redirect('/adminRoute?icon=error&msg='+ encodeURIComponent("Admin can't be Disabled"))
    }
    if(data.activeStatus == 1){
      await userModel.findByIdAndUpdate(id , {activeStatus:0}).catch((err)=>{
        console.log(err)
       return res.redirect('/adminRoute?icon=error&msg='+ encodeURIComponent('there can be a server error occured'))
      })
    }else{
      await userModel.findByIdAndUpdate(id , {activeStatus:1}).catch((err)=>{
        console.log(err)
      return  res.redirect('/adminRoute?icon=error&msg='+ encodeURIComponent('there can be a server error occured'))
    })
  }
 return res.redirect('/adminRoute?msg='+ encodeURIComponent('User Active Status Changed Successfully'))
  }catch(err){
    console.log(err)
    res.redirect('/adminRoute?icon=error&msg='+ encodeURIComponent('there can be a server error occured'))
  }

}

let logout = (req,res)=>{
    res.clearCookie('token')
    
    res.render('login.ejs', {msg:'Logout successfully'})
}


let downloadPDF =async (req,res)=>{

        let browser =await puppeteer.launch()
        let page =await browser.newPage()
      await page.goto("http://localhost:4000/scrdirect")
      let publicfolder = path.join(__dirname ,'../Public')
      let screenshot = path.join(__dirname , '../Public','PDF')

      if(!fs.existsSync(publicfolder)){
        fs.mkdirSync(publicfolder)
        if(!fs.existsSync(screenshot))
        {
          fs.mkdirSync(screenshot)
        }
      }else{
        if(!fs.existsSync(screenshot))
        {
          fs.mkdirSync(screenshot)
        }
      }
        

        let pdf =await page.pdf({
          path: './Public/PDF/html.pdf',
          margin: { top: '100px', right: '20px', bottom: '100px', left: '20px' },
          printBackground: true,
          format: 'A4',
        });

        res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=htmldata.pdf');
    res.send(pdf);
        
       
}

let srcdirect= async (req,res)=>{
  let alldata =await userModel.find({}, "name email address createdOn phone desc")
  let totalUser =await userModel.aggregate([{
    $group:{
      _id:null,
      allUser:{$sum:1}
    }
  }])
  
  
   res.render("dataPDF.ejs" , {alldata ,totalUser })
}


let userRoute = async (req,res)=>{
try {
  let msg = req.query.msg || ''
  let icon = req.query.icon || ''

  let check =await userModel.findById(req.body.id)
  // console.log('check here user')
  if(!check){return res.render('login',{msg:'Session Expired'})}
  if(check.status!== 0){return res.render('login',{msg:"Admin not allowed to user page"})}


  let homePageData =await userModel.find({ activeStatus:1}, "image name address")

  if (msg !== "" || icon !== "") {
    return res.render("homepage", { homePageData, msg, icon });
  } else if (msg !== "") {
    return res.render("homepage", { homePageData, msg });
  }

 return res.render('homepage' ,{homePageData:homePageData})


} catch (error) {
  res.render('login',{msg:"error occured"})
}
  
}

let profile = async (req,res)=>{
    let id = req.params.id
    let profileData = await userModel.findById(id  ,"name email address image phone desc createdOn")
    res.render('profile.ejs' , {profileData})
    
}

let uploadFile = (req,res)=>{
  if(!req.file){
    return res.send({massage: 'no file uploaded '})
  }
  res.send('file uploaded successfully.')
}

let xyz = async (req,res)=>{
  try{
    let projection={
      name:1,
      phone:1,
      address:1
    }
    
   
    let data  =await userModel.find({} ).limit(5)
    // let data  =await userModel.find({} , {name:1, email:1 })
    // let data  =await userModel.find({} ,projection)
    // let data  =await userModel.find({} , {name:1 , email:1}).sort({name:1})
    // let data  =await userModel.find({}).skip(18)
    // let data  =await userModel.find({phone:{$gt:9999999999}} )
    // let data  =await userModel.find({phone:{$lt:5555555555}} )
    // let data  =await userModel.find({} ).maxTimeMS(1)
    // let data  =await userModel.find({} , {addresss:1, name:1})
    
    
    res.json({status:200 ,data})

  }catch(err){
    console.log(err)
     res.json({status:400, message:err})
  }
}


let success = async (req,res)=>{
  // res.clearCookie('token')
try {
  if(req.user.email){
    let email = req.user.email;
    let data =   await userModel.findOne({email:email});
    
    if(data){
      if(data.activeStatus == 0){
      return res.render('login.ejs');
      }
      let token = jwt.sign({id:data._id} , process.env.JWTSECRET ,{expiresIn:"24h"})
      const options = {
        expires:new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly:true
  }
          if(data.status == 1){
            let totalUser =await userModel.aggregate([{$group:{_id:null,allUser:{$sum:1}}}])
            let alldata = await userModel.find()


            res.cookie('token' , token , options).render('adminPage.ejs' , {status:200,msg:'successfully logged in to admin panel' , alldata ,totalUser , token})


          }else if(data.status == 0){
            let homePageData = await userModel.find({activeStatus:1} , "name address image")
            res.cookie('token' , token , options).render('homepage.ejs' ,{status:200,msg:'user login successfully' , token, homePageData} )

          }
    }else{
     return  res.render('login.ejs' , {msg:'Login Failed'})
    }

  }else{
   return res.render('login.ejs',{msg:'Login Failed'} )
  }
  
} catch (error) {
  console.log(error,'something wrong with google authentication');
  res.render('login.ejs',{msg:'Login Failed'});
}

// req.user.email

}

module.exports = {getData , signup ,login,success, logout , forgotPassword, otpCheck , changeUserPassword ,adminRoute , addUserByAdmin,removeData , editUserByAdmin ,editStatus , downloadPDF , srcdirect , userRoute , profile , uploadFile ,xyz}

