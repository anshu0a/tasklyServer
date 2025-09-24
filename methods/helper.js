const User = require("../models/User");

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