const {STRIPE_SECRET_KEY , STRIPE_PUBLISHABLE_KEY} = process.env
let jwt = require('jsonwebtoken')
const userModel = require('../model/userModel');
const stripe = require('stripe')(STRIPE_SECRET_KEY)


let createCustomer =async (req,res)=>{
try {
    const {name , email , paymentmethod} = req.body
    const customer = await stripe.customers.create({
        name:name,
        email:email
        
    })
    res.status(200).render('cardDetails.ejs' ,{cid:customer.id,msg:'Payment Initalized successfully'});
} catch (error) {
    console.log(error , 'there is problem in creating customer')
    res.status(400).redirect('/userRoute');
}



}

let addNewCard =async (req,res)=>{
try {
    let token = req.cookies['token'];
    let id;
    if(token){

        jwt.verify(token ,process.env.JWTSECRET , (err,decode)=>{
           if(err){
             console.log("condition 5000 jwt failed")
             return res.render('login',{msg:'User session expired'})

           }else{
             id = decode.id;
           }
        })

    }else{

        return res.render('login',{msg:'invalid user',icon:'error'});
    }



    const { customer_id, email ,card_Name , stripeToken } = req.body;
    const card = await stripe.customers.createSource(customer_id, {
        source: stripeToken
    });
    const createCharges = await stripe.charges.create({
        receipt_email: email,
        amount: 500 * 100, 
        currency: 'INR',
        customer: customer_id,
        source: card.id
    });





if(createCharges['status'] == "succeeded" ){
    let status =1;
  let userData = await userModel.findOne({_id:id});
 if( userData.status == 0){
    
    let update = await userModel.findByIdAndUpdate(id, {status:status} )
    if(update){
       

      return  res.redirect('/adminRoute?icon=info&msg='+ encodeURIComponent('Payment Successfull, Welcome As SuperUser') )
    }else{
       
       return  res.redirect('/userRoute?icon=error&msg='+ encodeURIComponent('error in changing user plan') )
    }    

 }else{
    
   return res.redirect('/userRoute?icon=error&msg='+ encodeURIComponent('you are already a SuperUser'))

 }
    
    // res.render('homepage.ejs')
}else{
   return res.redirect('/userRoute?icon=error&msg='+ encodeURIComponent('Payment Unsuccessfull'))
}
    // res.send(createCharges);

} catch (error) {

    console.log(error,'some server error occured')
   return res.redirect('/userRoute?icon=error&msg='+ encodeURIComponent('Do Not Enter Real Card Details'))
    // res.redirect('/userRoute')
}    

}



module.exports = {createCustomer , addNewCard}