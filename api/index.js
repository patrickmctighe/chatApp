const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const env = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/Message");
const { create } = require("lodash");
const bcrypt = require("bcrypt");
const ws = require("ws");

env.config();
let mongoPass = process.env.MONGO_PASS;
let jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);
mongoose.connect(mongoPass);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // replace with the origin of your client
    credentials: true,
  })
);

async function getUserDataFromRequest(req){
    return new Promise((resolve, reject) => {
          if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
     resolve(userData);
        });
      } else{
            reject("no token")
      }
    })
  
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/messages/:useId", async (req, res) => {
    const { userId } = req.params;
const userData = await getUserDataFromRequest(req);
const ourUserId = userData.userId;
const messages = await Message.find({
sender:{$in: [userId, ourUserId]},
recipient: {$in: [userId, ourUserId]}
}).sort({createdAt: -1}).limit(20).exec((err, messages) => {
})
res.json(messages)
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
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = await bcrypt.compare(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "None", secure: true })
            .json({ id: foundUser._id, username: foundUser.username });
        }
      );
    }
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "None", secure: true })
          .status(201)
          .json({ _id: createdUser._id, username });
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = 4040;

const server = app.listen(PORT);

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  //decode token
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.trim().startsWith("token=")); 
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;

    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
                recipient,
              id: messageDoc._id,
            })
          )
        );
    }
  });
  // Send online users to all clients when a new client connects
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
