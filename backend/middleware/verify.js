const jwt=require("jsonwebtoken");
const verify=async(req,res,next)=>{
    //  const token=req.body.token;
    var token=req.headers.authorization;
    console.log(" header token=",req.headers.authorization); 
 if(token){
        jwt.verify(token,"Private_key",function(error,decode){
            if(error){
                 console.log("error in token=",error);
                 res.send({message:"token invalid",status:1});
             }
             else{
                 console.log(" success token=",decode);
                 next();
           }
         })
    }
     else{
         res.send({message:"token is not found",status:0});
     }
    
}
module.exports=verify;