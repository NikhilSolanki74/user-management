let express = require('express')
let app = express()
let cookieparser = require('cookie-parser')
let session = require('express-session')

require('dotenv').config()


let bodyparser = require('body-parser')
app.use(express.json())
app.use(cookieparser())

let dbconnect = require('./DbConnection/dbconnect')
dbconnect();

app.use(session({
    // name:'abc',
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    
}))

app.set('view engine' , 'ejs')
app.use(bodyparser.urlencoded({extended:true}))


let PORT = process.env.PORT || 3000

    
app.use('/', require('./routes/route'))

app.get('*',(req,res)=>{
    
    res.render('pageNotFound.ejs')
})

app.listen(PORT, ()=>{
    console.log(`server in running on port ${PORT}`)
})  



