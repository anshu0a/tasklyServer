const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerOneUser = async (req, res) => {
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

    // Generate JWT token with photo included
    const token = jwt.sign(
      { id: user._id, username: user.username, photo: user.photo  || "hello"},
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return token with welcome message
    res.json({
      error: false,
      message: `Welcome ${name} in Taskly`,
      token,
    });

  } catch (err) {
    console.error("Error while registering user:", err);
    res.json({ error: true, message: "Server side error" });
  }
};
