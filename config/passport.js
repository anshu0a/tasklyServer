const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const isProd = process.env.NODE_ENV === "production";

module.exports = function (passport) {
  // ======================
  // LOCAL STRATEGY
  // ======================
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // ======================
  // GOOGLE STRATEGY
  // ======================
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: isProd
          ? "https://tasklyserver-0ux1.onrender.com/api/auth/google/callback"
          : "http://localhost:3000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const name = profile.displayName;
          const email = profile.emails && profile.emails[0]?.value;
          const photo = profile.photos && profile.photos[0]?.value;
          const provider = profile.provider;


          let baseUsername = email ? email.split("@")[0] : profile.id;
          let username = baseUsername;

          // Check for uniqueness
          let counter = 1;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          let user = await User.findOne({ googleId });

          if (!user) {
            user = await User.create({
              username,
              googleId,
              name,
              email,
              photo,
              provider,
            });
          }

          return done(null, user);

        }
        catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // ======================
  // SERIALIZE & DESERIALIZE
  // ======================
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
