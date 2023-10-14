var express = require("express");
var app = express();
var cors = require("cors");
app.use(cors());
var multer = require("multer");
var upload = multer();
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var verify = require("../backend/middleware/verify.js");
// const dbConnect = require("../dbConfig/config");

const { MongoClient } = require("mongodb");
async function dbConnect(collection) {
  var url = "mongodb://127.0.0.1:27017";
  var client = new MongoClient(url);
  var connect = client.db("Amazonweb");
  if (collection == "project") {
    var collection = connect.collection("project");
    return collection;
  } else {
    var collection = connect.collection("User");
    return collection;
  }
}

// app.get("/",function(req,res){
//     var name="Raksha";
//     res.send({message:"Hello everyone",name:name});
// });

// app.get("/users",function(req,res){
//     var name="Raksha";
//     var email="xyz@gmail.com";
//     res.send({message:"Hello users",name:name,email:email});
// });

app.post("/register", upload.single(), async function (req, res) {
  const { name, email, password, confirm_password, address } = req.body;
  console.log(
    "fname,email,password,cpassword,address",
    name,
    email,
    password,
    confirm_password,
    address
  );
  if (name && email && password && confirm_password && address) {
    if (password == confirm_password) {
      var user = await dbConnect();
      var hashPassword = await bcrypt.hash(password, 10);
      console.log("hashpassword=", hashPassword);
      var findUser = await user.findOne({ email: email });
      if (findUser) {
        res.send({ message: "user already register", status: 1 });
      } else {
        var insertData = await user.insertOne({
          name: name,
          email: email,
          password: hashPassword,
          confirm_password: confirm_password,
          address: address,
          status: 1, //by default active=1
        });
        if (insertData) {
          res.send({ message: "Registration successfully", status: 1 });
        } else {
          res.send({ message: "Registration failed", status: 0 });
        }
      }
    } else {
      res.send({ message: "password is not match", status: 0 });
    }
  } else {
    res.send({
      message: "name, email,password,confirm_password not be empty",
      status: 0,
    });
  }
});

app.post("/login", upload.single(), async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    const user = await dbConnect();
    const findUser = await user.findOne({ email: email });
    if (findUser) {
      if (findUser.email == email) {
        bcrypt.compare(
          password,
          findUser.password,
          async function (error, result) {
            console.log("result=", result);
            console.log("error=", error);
            if (result) {
              const token = jwt.sign({ email: findUser.email }, "Private_key", {
                expiresIn: "50min",
                algorithm: "HS256",
              });
              console.log("token=", token);
              const updateUser = await user.updateOne(
                { email },
                { $set: { token: token } }
              );
              res.send({
                message: "login successfully",
                status: 1,
                token: token,
                email: email,
                data: updateUser,
              });
            } else {
              res.send({ message: "please enter valid password", status: 0 });
            }
          }
        );
      } else {
        res.send({ message: "login failed", status: 0 });
      }
    } else {
      res.send({ message: "user not found", status: 0 });
    }
  } else {
    res.send({ message: "email and password not empty", status: 0 });
  }
});

app.post("/delete/:email", upload.single(), verify, async function (req, res) {
  const { email } = req.params;
  // const{status}=req.body;
  console.log("email=", email);
  if (email) {
    var user = await dbConnect();
    var findUser = await user.findOne({ email: email });
    console.log("findUser=", findUser);
    if (findUser) {
      var deleteUser = await user.deleteOne({ email: email });
      if (deleteUser) {
        res.send({ message: "user deleted successfully", status: 1 });
      } else {
        res.send({ message: "something went wrong", status: 0 });
      }
    } else {
      res.send({ message: "user not found", status: 0 });
    }
  } else {
    res.send({ message: "email should not be empty", status: 0 });
  }
});

app.post("/update/:email", upload.single(), verify, async function (req, res) {
  const { email } = req.params;
  const { name } = req.body;
  console.log("email,name=", email, name);
  if (email) {
    if (name != "" && name != "undefined" && name != "null") {
      var user = await dbConnect();
      var findUser = await user.findOne({ email: email });
      if (findUser) {
        var updateUser = await user.updateOne(
          { email: email },
          { $set: { name: name } }
        );
        if (updateUser) {
          res.send({ message: "update user successfully", status: 1 });
        } else {
          res.send({ message: "user not updated", status: 0 });
        }
      } else {
        res.send({ message: "user not found", status: 0 });
      }
    } else {
      res.send({ message: "please enter name first", status: 0 });
    }
  } else {
    res.send({ message: " enter valid email", status: 0 });
  }
});

app.post("/disable/:email", upload.single(), verify, async function (req, res) {
  const email = req.params.email;
  const { status } = req.body;
  if (email) {
    if (status) {
      var user = await dbConnect();
      findUser = await user.findOne({ email: email });
      if (findUser.status == 1) {
        var updateUser = await user.updateOne(
          { email: email },
          { $set: { status: status } }
        );
        if (updateUser) {
          res.send({ message: "user disable", status: 1 });
        } else {
          res.send({ message: "user not disable", status: 0 });
        }
      } else {
        res.send({ message: "user not found", status: 0 });
      }
    } else {
      res.send({ message: "empty status", status: 0 });
    }
  } else {
    res.send({ message: "enter valid email", status: 0 });
  }
});

app.post("/enable/:email", upload.single(), verify, async function (req, res) {
  const email = req.params.email;
  const { status } = req.body;
  if (email) {
    if (status) {
      var user = await dbConnect();
      var findUser = await user.findOne({ email: email });
      if (findUser.status == 0) {
        var updateUser = await user.updateOne(
          { email: email },
          { $set: { status: status } }
        );
        if (updateUser) {
          res.send({ message: "user enable successfully", status: 1 });
        } else {
          res.send({ message: "user not enable ", status: 0 });
        }
      } else {
        res.send({ message: "user not found", status: 0 });
      }
    } else {
      res.send({ message: "enter status first", status: 0 });
    }
  } else {
    res.send({ message: "enter valid email", status: 0 });
  }
});
app.get(
  "/specificuserDetails/:email",
  upload.single(),
  verify,
  async function (req, res) {
    const email = req.params.email;
    console.log("email=", email);
    const user = await dbConnect();
    const specificUserData = await user.findOne({ email });
    console.log("specificUserData", specificUserData);
    if (specificUserData) {
      res.send({
        message: "all user data fetch",
        status: 1,
        user: specificUserData,
      });
    } else {
      res.send({ message: "all user data not fetch", status: 0 });
    }
  }
);
app.post(
  "/user/:email/orderBooked",
  upload.single(),
  verify,
  async function (req, res) {
    const { email } = req.params;
    const { address, price, Payment_mode, Delivery_date, orderId, status } =
      req.body;
    console.log("email=", email);
    if (email) {
      if (email != "" && email != "undefined" && email != "null") {
        var orders = await dbConnect("orders");
      }
      var insertData = await orders.insertOne({
        price: price,
        email: email,
        Payment_mode: Payment_mode,
        Delivery_date: Delivery_date,
        status, //by default active=1,
        address,
        Product_id: 1,
        orderId: orderId,
      });
      if (insertData) {
        res.send({ message: "order placed successfully", status: 1 });
      } else {
        res.send({ message: "Something went wrong!", status: 0 });
      }
    } else {
      res.send({ message: "please enter your valid email", status: 0 });
    }
  }
);
app.post("/delete/:email", upload.single(), verify, async function (req, res) {
  const { email } = req.params;
  // const{status}=req.body;
  console.log("email=", email);
  if (email) {
    var user = await dbConnect();
    var findUser = await user.findOne({ email: email });
    console.log("findUser=", findUser);
    if (findUser) {
      var deleteUser = await user.deleteOne({ email: email });
      if (deleteUser) {
        res.send({ message: "user deleted successfully", status: 1 });
      } else {
        res.send({ message: "something went wrong", status: 0 });
      }
    } else {
      res.send({ message: "user not found", status: 0 });
    }
  } else {
    res.send({ message: "email should not be empty", status: 0 });
  }
});

app.post("/update/:email", upload.single(), verify, async function (req, res) {
  const { email } = req.params;
  const { name } = req.body;
  console.log("email,name=", email, name);
  if (email) {
    if (name != "" && name != "undefined" && name != "null") {
      var user = await dbConnect();
      var findUser = await user.findOne({ email: email });
      if (findUser) {
        var updateUser = await user.updateOne(
          { email: email },
          { $set: { name: name } }
        );
        if (updateUser) {
          res.send({ message: "update user successfully", status: 1 });
        } else {
          res.send({ message: "user not updated", status: 0 });
        }
      } else {
        res.send({ message: "user not found", status: 0 });
      }
    } else {
      res.send({ message: "please enter name first", status: 0 });
    }
  } else {
    res.send({ message: " enter valid email", status: 0 });
  }
});

app.post("/disable/:email", upload.single(), verify, async function (req, res) {
  const email = req.params.email;
  const { status } = req.body;
  if (email) {
    if (status) {
      var user = await dbConnect();
      findUser = await user.findOne({ email: email });
      if (findUser.status == 1) {
        var updateUser = await user.updateOne(
          { email: email },
          { $set: { status: status } }
        );
        if (updateUser) {
          res.send({ message: "user disable", status: 1 });
        } else {
          res.send({ message: "user not disable", status: 0 });
        }
      } else {
        res.send({ message: "user not found", status: 0 });
      }
    } else {
      res.send({ message: "empty status", status: 0 });
    }
  } else {
    res.send({ message: "enter valid email", status: 0 });
  }
});

app.post("/enable/:email", upload.single(), verify, async function (req, res) {
  const email = req.params.email;
  const { status } = req.body;
  if (email) {
    if (status) {
      var user = await dbConnect();
      var findUser = await user.findOne({ email: email });
      if (findUser.status == 0) {
        var updateUser = await user.updateOne(
          { email: email },
          { $set: { status: status } }
        );
        if (updateUser) {
          res.send({ message: "user enable successfully", status: 1 });
        } else {
          res.send({ message: "user not enable ", status: 0 });
        }
      } else {
        res.send({ message: "user not found", status: 0 });
      }
    } else {
      res.send({ message: "enter status first", status: 0 });
    }
  } else {
    res.send({ message: "enter valid email", status: 0 });
  }
});
app.get(
  "/specificuserDetails/:email",
  upload.single(),
  verify,
  async function (req, res) {
    const email = req.params.email;
    console.log("email=", email);
    const user = await dbConnect();
    const specificUserData = await user.findOne({ email });
    console.log("specificUserData", specificUserData);
    if (specificUserData) {
      res.send({
        message: "all user data fetch",
        status: 1,
        user: specificUserData,
      });
    } else {
      res.send({ message: "all user data not fetch", status: 0 });
    }
  }
);
app.post(
  "/user/:email/orderBooked",
  upload.single(),
  verify,
  async function (req, res) {
    const { email } = req.params;
    const { address, price, Payment_mode, Delivery_date, orderId, status } =
      req.body;
    console.log("email=", email);
    if (email) {
      if (email != "" && email != "undefined" && email != "null") {
        var orders = await dbConnect("orders");
      }
      var insertData = await orders.insertOne({
        price: price,
        email: email,
        Payment_mode: Payment_mode,
        Delivery_date: Delivery_date,
        status, //by default active=1,
        address,
        Product_id: 1,
        orderId: orderId,
      });
      if (insertData) {
        res.send({ message: "order placed successfully", status: 1 });
      } else {
        res.send({ message: "Something went wrong!", status: 0 });
      }
    } else {
      res.send({ message: "please enter your valid email", status: 0 });
    }
  }
);

app.listen(8000, function () {
  console.log("Server running on http://localhost:8000");
});
