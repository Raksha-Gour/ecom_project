// const { MongoClient } = require("mongodb");
// async function dbConnect(collection) {
//   var url = "mongodb://127.0.0.1:27017";
//   var client = new MongoClient(url);
//   var connect = client.db("Practice");
//   if(collection=="orders"){
//     var collection = connect.collection("Orders");
//     return collection;
//   }
//   else{
//     var collection = connect.collection("user");
//     return collection;
//   }
  
// }

// module.exports=dbConnect;