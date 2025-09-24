const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerOneUser =  async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !name || !password) {
      return res.json({ error: true, message: "Something is missing in form." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ error: true, message: "Username already exists" });
    }

    const user = new User({ username, name, password, provider: "create" });
    await user.save();

    //  Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    //  Return token with success message
    res.json({
      error: false,
      message: `Welcome ${name} in taskly`,
      token,
    });

  } catch (err) {
    console.error(err);
    res.json({ error: true, message: "Server side error" });
  }
}