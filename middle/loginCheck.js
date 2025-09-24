const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.send({ notLogin: true, message: "Unauthorized: No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.send({ notLogin: true, message: "User does not exist" });

    req.user = decoded; 
    next();
  } catch (err) {
    return res.send({ notLogin: true, message: "Unauthorized: Invalid or expired token" });
  }
}

module.exports = authMiddleware;
