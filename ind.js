const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const path = require("path")
require("./config/passport")(passport);
const app = express();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });



//------------------------------------------------------------ Middleware

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONT_END || "https://taskly-6k7xx162k-anshus-projects-270ebc69.vercel.app",
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked CORS request from:", origin);
      return callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

const isLogin = require('./middle/loginCheck');

//------------------------------------------------------------------models

const User = require("./models/User");
const Task = require("./models/Task");

//-----------------------------------------------------------------methods

const { loginOneuser } = require("./methods/login.js");
const { registerOneUser } = require("./methods/create.js");
const { userExist } = require("./methods/helper.js");
const { googleCallback, googleUrl, loginfail } = require("./methods/google.js");
const { addTask, istaskName, getmydata, getOtherTasks, pullPushTask, getOneTask, markDone, addOneMinute, killTask } = require("./methods/task.js");
const { addComment, removeComment } = require("./methods/comments.js");

//------------------------------------------------------------- MongoDB connect

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++( Routes )+++++++++++++++++++++++++++++++++++++

//_________________________________________________________________ Google login __________________________________
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));
app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "/api/loginfail" }), googleCallback);
app.get("/api/auth/google/url", googleUrl);
app.get("/api/loginfail", loginfail);
//________________________________________________________________ Register (local)________________________________
app.post("/api/registerUser", registerOneUser);
//__________________________________________________________________ Login (local)_________________________________
app.post("/api/login", loginOneuser);
// ___________________________________________________________________user exist __________________________________
app.post("/api/isuserexist", userExist);
// _________________________________________________________________giving home data________________________________
app.get("/api/getHomeData", isLogin, (req, res) => {
  // console.log(req.user)
  res.send({ success: true, message: "Hello from backend ...[][][]", user: req.user.username });
})
// ___________________________________________________________________add task  __________________________________
app.post("/api/tasks", isLogin, upload.fields([{ name: "voice", maxCount: 1 }, { name: "images" }]), addTask);
// ___________________________________________________________________task exist or not  __________________________________
app.post("/api/isTaskExist", isLogin, istaskName);
// ___________________________________________________________________ fetch my all tasks __________________________________
app.get("/api/myAllTasks", isLogin, getmydata);
// ___________________________________________________________________ fetch global all tasks __________________________________
app.get("/api/otherAllTasks", isLogin, getOtherTasks);
// ___________________________________________________________________ grab task to own __________________________________
app.get("/api/pullPushTask/:taskId", isLogin, pullPushTask);
// ___________________________________________________________________ get one task one view __________________________________
app.get("/api/getOneTask/:taskId/:search", isLogin, getOneTask);
// ___________________________________________________________________ add comments __________________________________
app.post("/api/addCmt/:search", isLogin, addComment);
// ___________________________________________________________________ remove comments __________________________________
app.post("/api/removeCmt/:userId/:taskId/:msgId/:search", isLogin, removeComment);

app.post("/api/markToggle/:taskId/:search", isLogin, markDone);

app.post("/api/addOneMinut/:taskId", isLogin, addOneMinute);

app.post("/api/killTask/:taskId", isLogin, killTask);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Logout
app.post("/logout", (req, res) => {
  // if using cookies
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
