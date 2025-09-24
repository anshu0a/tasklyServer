const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },

  name: { type: String },
  photo: { type: String },
  email: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  provider: { type: String },
  mobile: { type: Number },
  birth: { type: Date },
  tasks: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      addedAt: { type: Date, default: Date.now },
      spend: { type: Number, default: 0 },
      isDone: { type: Boolean, default: false },
      cmt: [
        {
          msg: { type: String },
          createdAt: { type: Date, default: Date.now },
          person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        }
      ]
    }
  ]
});

// Hash password before saving (only if password exists)
UserSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password (local login only)
UserSchema.methods.isValidPassword = async function (password) {
  if (!this.password) return false; 
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
