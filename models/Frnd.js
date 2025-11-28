const mongoose = require("mongoose");

const FrndSchema = new mongoose.Schema({
    frnd1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    frnd2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, default: "pending", enum: ["pending", "accepted"] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Frnd", FrndSchema);
