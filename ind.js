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
  "https://taskly-three-sage.vercel.app",
  "https://taskly-git-main-anshus-projects-270ebc69.vercel.app",
  "https://taskly-rjsox8typ-anshus-projects-270ebc69.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl, mobile apps, etc.
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log("Blocked CORS request from:", origin);
    callback(new Error("CORS not allowed from this origin"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
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
const Frnd = require("./models/Frnd");

//-----------------------------------------------------------------methods

const { loginOneuser, getUsername } = require("./methods/login.js");
const { registerOneUser } = require("./methods/create.js");
const { userExist } = require("./methods/helper.js");
const { googleCallback, googleUrl, loginfail } = require("./methods/google.js");
const { addTask, istaskName, getmydata, getOtherTasks, pullPushTask, getOneTask, markDone, addOneMinute, killTask } = require("./methods/task.js");
const { addComment, removeComment } = require("./methods/comments.js");
const { getProfileInfo, addOneLink, removeLink, frndReq, getMyfrnd } = require("./methods/Profile.js");
const { addOneDare, getMyChallenges, getOtherChallenges, oneDare, grabDare, deleteDare, markDare, updateStreek } = require("./methods/dare.js");

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
// ___________________________________________________________________get username ________________________________
app.get("/api/getUsername", isLogin, getUsername);
// _________________________________________________________________giving home data_______________________________
app.get("/api/getHomeData", isLogin, (req, res) => {
  // console.log(req.user)
  res.send({ success: true, message: "Hello from backend ...[][][]", user: req.user.username });
})
// ___________________________________________________________________add task  __________________________________
app.post("/api/tasks", isLogin, upload.fields([{ name: "voice", maxCount: 1 }, { name: "images" }]), addTask);
// ___________________________________________________________________task and dare exist or not  __________________________________
app.post("/api/isExist/:type", isLogin, istaskName);
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
// ___________________________________________________________________ done my task __________________________________
app.post("/api/markToggle/:taskId/:search", isLogin, markDone);
// ___________________________________________________________________ add one minut from timer in task __________________________________
app.post("/api/addOneMinut/:taskId", isLogin, addOneMinute);
// ___________________________________________________________________ delete certain task __________________________________
app.post("/api/killTask/:taskId", isLogin, killTask);
// ___________________________________________________________________ get profile details __________________________________
app.get("/api/getProfileInfo/:person", isLogin, getProfileInfo);
// ___________________________________________________________________ Add one Link __________________________________
app.post("/api/addLink", isLogin, addOneLink);
// ___________________________________________________________________ remove one Link __________________________________
app.post("/api/removeLink/:id", isLogin, removeLink);
// ___________________________________________________________________ frnd request __________________________________
app.get("/api/frndRequest/:frndId", isLogin, frndReq);
// ___________________________________________________________________ frnd request __________________________________
app.get("/api/getMyFrnd", isLogin, getMyfrnd);
// ___________________________________________________________________ add one dare __________________________________
app.post("/api/addOneDare", isLogin, upload.fields([{ name: "voice", maxCount: 1 }, { name: "images" }]), addOneDare);
// ___________________________________________________________________get my dare __________________________________
app.get("/api/myAllDares", isLogin, getMyChallenges);
// ___________________________________________________________________ get all public dare __________________________________
app.get("/api/otherAllDares", isLogin, getOtherChallenges);
// ___________________________________________________________________ get one dare __________________________________
app.get("/api/oneDare/:dareId/:type", isLogin, oneDare);
// ___________________________________________________________________ grab dare __________________________________
app.post("/api/grabDare/:dareId", isLogin, grabDare);
// ___________________________________________________________________ delete grab __________________________________
app.post("/api/deleteDare/:dareId/:type", isLogin, deleteDare);
// ___________________________________________________________________ mark dare __________________________________
app.post("/api/markDare/:dareId/:oneId/:work", isLogin, markDare);
// ___________________________________________________________________ update streek __________________________________
app.post("/api/updateStreek/:dareId/", isLogin, updateStreek);


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Logout
app.post("/logout", (req, res) => {
  // if using cookies
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
