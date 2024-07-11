let multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Public/images'); 
    },
    filename: function (req, file, cb) {
        let name = Date.now()+ file.originalname
        
        
        cb(null ,  name)
    }
  });
  
 let upload =  multer({ storage: storage, limits:{fileSize:1024*1024*4} })
 module.exports = upload
