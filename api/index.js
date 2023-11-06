const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const { create } = require("lodash");

env.config();
let mongoPass = process.env.MONGO_PASS;
let jwtSecret = process.env.JWT_SECRET;

mongoose.connect(mongoPass);

const app = express();
app.use(express.json());
app.use()
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.get("/test", (req, res) => {
  res.json("test ok");
});


app.get("/profile", async (req, res) => {
  const {token} = req.cookies?.token;
  if(token){
 jwt.verify(token, jwtSecret,{},(err,userData)=>{
if(err) throw err;
res.json(userData)
 });
}else{
  res.status(401).json("no token");
}
});


app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const createdUser = await User.create({ username, password });
    jwt.sign({ userId: createdUser._id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).status(201).json({ _id: createdUser._id , username}); // Fix the typo here
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = 4040;

app.listen(`${PORT}`, () => {
  console.log(`Server running on port ${PORT}`);
});
