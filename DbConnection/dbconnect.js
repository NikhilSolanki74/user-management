const mongoose = require('mongoose')
require('dotenv').config()

let dbconnect=async ()=>{

   await mongoose.connect(process.env.MONGOURL ).then(
    ()=>{
    console.log('database connection successfull')}
    ).catch(
    (err)=>{
    console.log('prolem occured in database connection')
    console.log(err)
   })

}


module.exports = dbconnect;

