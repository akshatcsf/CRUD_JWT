require("dotenv").config();
require("./config/database").connect();
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs")
const express = require("express");

const app = express();

app.use(express.json());

// Logic goes here
// importing user context
const User = require("./model/user");

const auth = require("./middleware/auth");
const { deleteOne } = require("./model/user");

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});
app.delete("/delete", async (req,res)=>{
    try{
        const {email}=req.query;
        if(!email)
        res.status(400).send("Enter the Details Again");
        const user= await User.findOne({email});

        await User.deleteOne({email});
        res.status(200).send("done");
    }
    catch(err){
        console.log( err);
    }
})
app.get("/read", async (req,res)=>{
    try{
       const {email}=req.query;
       console.log(req.query);
       if(!email)
       res.status(400).send("Enter the Details Again");

       const user= await User.findOne({email});
       console.log(email, user);
       return res.status(200).send(user);
    }
    catch(err){
        console.log(err);
    }
})

app.post("/update",async (req,res)=>{
    try{
        const { first_name, last_name, email, password } = req.body;
  
        // Validate user input
        if (!(email  && (first_name || last_name))) {
          res.status(400).send("All input is required");
        }
        const UpdatedUser = await User.findOneAndUpdate({email},{
              first_name:first_name,
              last_name,
        })
       res.status(200).send(`all done `);
    }
    catch(err){
        console.log(err);
    }
})


app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { first_name, last_name, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && first_name && last_name)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  

// Login
app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  
module.exports = app;