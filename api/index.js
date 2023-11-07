const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const env = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const { create } = require("lodash");
const bcrypt = require("bcrypt");

env.config();
let mongoPass = process.env.MONGO_PASS;
let jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);
mongoose.connect(mongoPass);

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(
    cors({
      origin: 'http://localhost:5173', // replace with the origin of your client
      credentials: true,
    })
  );

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/profile", async (req, res) => {
  const token = req.cookies.token; 
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({username});
  if(foundUser){
    const passOk =  bcrypt.compare(password, foundUser.password);
    if(passOk){
      jwt.sign({userId:foundUser._id}, jwtSecret, {}, (err, token) => {
        if(err) throw err;
        res.cookie("token", token,{sameSite:"None",secure:true}).json({id:foundUser._id});
      });
    }
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({ username:username, password: hashedPassword });
    jwt.sign({ userId: createdUser._id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, {sameSite:"None", secure:true}).status(201).json({ _id: createdUser._id , username});
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = 4040;

app.listen(`${PORT}`, () => {
  console.log(`Server running on port ${PORT}`);
});