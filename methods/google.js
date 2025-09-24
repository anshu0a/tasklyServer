const jwt = require("jsonwebtoken");

const frontendLink = (process.env.NODE_ENV === "production"
  ? process.env.FRONT_END
  : "http://localhost:5173"
).replace(/\/$/, "");

exports.googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: true, message: "User not authenticated" });
    }

    const token = jwt.sign(
      {
        id: req.user._id,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
        googleId: req.user.googleId,
        provider: req.user.provider,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.send(`
  <html>
    <body>
      <script>
        console.log("About to postMessage to opener:", "${new URL(frontendLink).origin}");
        try {
          window.opener.postMessage(
            { token: ${JSON.stringify(token)}, message: "Login successful" },
            "${new URL(frontendLink).origin}"
          );
          console.log("✅ postMessage sent");
          window.close();
        } catch (e) {
          console.error("❌ postMessage error", e);
          document.body.innerHTML = "<p>Login successful! Please close this window.</p>";
        }
      </script>
      <p>Login successful! You can close this window.</p>
    </body>
  </html>
`);

  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({ error: true, message: "Server error during Google login" });
  }
};

exports.googleUrl = (req, res) => {
  try {
    const googleLoginUrl = "/api/auth/google";
    res.json({ url: googleLoginUrl });
  } catch (err) {
    console.error("Error generating Google URL:", err);
    res.status(500).json({ error: true, message: "Could not generate login URL" });
  }
};

exports.loginfail = (req, res) => {
  console.log("Redirect to login again");
  res.status(401).json({ error: true, message: "Login failed" });
};
