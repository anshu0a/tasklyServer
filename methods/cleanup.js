const Dare = require("../models/Dare");
const Task = require("../models/Task");
const User = require("../models/User");
const { deleteImage } = require("../config/cloudnary.js");

exports.deleteExpiredDares = async () => {
  const expiredDares = await Dare.find({
    $expr: {
      $gt: [
        { $subtract: [Date.now(), { $toLong: "$createdAt" }] },
        { $multiply: ["$days", 24 * 60 * 60 * 1000] }
      ]
    }
  }).select("_id images");
  const expiredDareIds = expiredDares.map(d => d._id);

  for (const dare of expiredDares) {
    for (const img of dare.images) {
      if (img.filename !== "default" && img.public_id !== "default") {
        await deleteImage(img.public_id);
      }
    }
  }

  await User.updateMany(
    { "challenges.dare": { $in: expiredDareIds } },
    {
      $pull: {
        challenges: { dare: { $in: expiredDareIds } }
      }
    }
  );

  await Dare.deleteMany({
    _id: { $in: expiredDareIds }
  });
};



exports.deleteExpiredTasks = async () => {

  const expiredTasks = await Task.find({
    $expr: {
      $gt: [
        { $subtract: [Date.now(), { $toLong: "$createdAt" }] },
        { $multiply: ["$timeLine", 24 * 60 * 60 * 1000] }
      ]
    }
  }).select("_id owner images");

  const expiredTaskIds = expiredTasks.map(t => t._id);

  for (const task of expiredTasks) {
    for (const img of task.images) {
      if (img.filename !== "default" && img.public_id) {
        await deleteImage(img.public_id);
      }
    }
  }

  await User.updateMany(
    { "tasks._id": { $in: expiredTaskIds } },
    {
      $pull: {
        tasks: { _id: { $in: expiredTaskIds } }
      }
    }
  );

  await Task.deleteMany({
    _id: { $in: expiredTaskIds }
  });
};
