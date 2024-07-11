const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String ,required:true},
    password:{type:String,required:true},
    phone:{type:Number , default:838833833},
    address:{type:String , default:'address in this /'},
    desc:{type:Object ,default:{'intro':'default dummy text from schema'}},
    image:{type:String , required:true },
    status:{type:Number,default:0},
    forgotToken:{type:String ,default:null},
    otp:{type:String,default:null},
    createdOn:{type:Date , default:Date.now()},
    activeStatus:{type:Number , default:1}
})

const userModel = new mongoose.model('userModel' , userSchema)

module.exports = userModel;