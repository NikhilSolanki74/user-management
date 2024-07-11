 <script>
 let a =true,b = true,actualpass =''; 

let updatePass = () =>{
     actualpass = document.getElementById('inputPassword').value;
     document.getElementById('realPassword').value = actualpass;
     
}


let showPass = ()=>{
    {/* if(a){
        actualpass = document.getElementById('inputPassword').value
        
         a=false
    } */}
    let str =''
  let size = actualpass.length 
 for(let i =0 ; i<size ;i++){
  str = str + '*'
 }
    if(b){
        document.getElementById('inputPassword').value=str 
     b=false
    }else{
        document.getElementById('inputPassword').value = actualpass
        b=true
    }
}


</script>
