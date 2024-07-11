const cloudinary  =require('cloudinary').v2   


let cloudUpload = async (req,res,next)=>{

  cloudinary.config({ 
     cloud_name: process.env.CLOUD_NAME, 
     api_key: process.env.API_KEY, 
     api_secret: process.env.API_SECRET 
   });
//    await cloudinary.uploader.upload('../Public/images/'+ req.file.filename).then((data)=>{console.log("condition 999 ",data)})
   console.log('condition 899' , req.file)
cloudinary.uploader.upload(req.file.path, { public_id: req.file.filename })
.then((result) => {
    req.file.filename = result.secure_url;
  console.log(result);
})
.catch((error) => {
  console.error(error);
});

   next();

}


module.exports  = cloudUpload;
