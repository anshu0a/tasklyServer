const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.loginOneuser =  async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.send({ error: true, message: "User not found" });

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) return res.send({ error: true, message: "Incorrect password" });


    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.send({ error: false, token });

  } catch (err) {
    res.send({ error: true, message: 'Server side error' })
    console.log("ERROR WHILE LOGIN : ",err)
  }
}
exports.userExist = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Username is required" });
  }

  try {
    const user = await User.findOne({ username: name });

    if (user) {
      return res.json({ error: false, exists: true, username: name });
    } else {
      return res.json({ error: false, exists: false, username: name });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: true, message: "Server side error" });
  }
}