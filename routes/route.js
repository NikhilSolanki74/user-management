let express = require('express')

let router = express.Router()
let Auth2 = require('../middleware/auth2')
let Auth = require('../middleware/auth')
let Auth3 = require('../middleware/auth3')
let upload = require('../middleware/upload')
let passport = require('passport');
require('../passport')

const {getData,login  , signup, forgotPassword, otpCheck  ,changeUserPassword ,adminRoute , addUserByAdmin , removeData  , editUserByAdmin, editStatus ,success, logout , srcdirect, downloadPDF ,userRoute , profile , uploadFile, xyz} = require('../controllers/userCtrl')
const {createCustomer , addNewCard , createCharges} = require('../controllers/paymentCtrl')
router.use(passport.initialize())
router.use(passport.session())

router.get('/auth/google', passport.authenticate('google' , {scope:['email', 'profile']}))

router.get('/auth/google/callback' , passport.authenticate('google' , {
    successRedirect:'/success',
    failureRedirect:'/failure'
}))


router.get('/success',success)

router.get('/failure', (req,res)=>{
    res.render('login.ejs')
})
router.get('/',(req,res)=>{
    res.render('signup.ejs')
})
router.get('/login',(req,res)=>{
    res.render('login.ejs')
})
router.get('/forgotRoute' , (req,res)=>{
    res.render('forgotOne.ejs')
})

router.get('/newEntry',Auth , (req,res)=>{
    res.render('newEntry.ejs')
})

router.get('/editData/:id',Auth, (req,res)=>{
    let userId = req.params.id
    res.render('editPage.ejs' , {userId} )
})


router.get('/scrdirect',srcdirect)

router.get('/downloadPDF' , downloadPDF)

router.get('/logout' , logout)

router.post('/editStatus/:id',Auth,editStatus)

router.post('/editUserByAdmin', Auth,editUserByAdmin)

router.post('/removeData/:id',Auth, removeData)
 
router.get('/adminRoute',Auth ,adminRoute )

router.get('/userRoute' ,Auth,userRoute)

router.post('/addUserByAdmin',Auth, addUserByAdmin)

router.post('/abcd' , forgotPassword)

router.post('/changeUserPassword' , changeUserPassword)

router.post('/userSignup' ,upload.single('image'), signup)

router.post('/userLogin',Auth2 , login)

router.post('/getData' ,Auth , getData)

router.post('/otpCheck',Auth2 , otpCheck)
 
router.get('/profile/:id' , Auth , profile)

router.get('/xyz' ,xyz)

router.get('/createcustomer', Auth , (req,res)=>{
    res.render('customer.ejs');
})
router.post('/create-customer' , createCustomer)

// router.get('/addcard',Auth , (req,res)=>{
//     res.render('cardDetails.ejs')
// })
router.post('/add-new-card' , addNewCard)



module.exports = router;

