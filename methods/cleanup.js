const Dare = require("../models/Dare");
const Task = require("../models/Task");
const { deleteImage } = require("../config/cloudnary.js");

exports.deleteExpiredDares = async () => {
  const expiredDares = await Dare.find({
    $expr: {
      $gt: [
        {
          $subtract: [
            Date.now(),
            { $toLong: "$createdAt" }
          ]
        },
        { $multiply: ["$days", 24 * 60 * 60 * 1000] }
      ]
    }
  });

  for (const dare of expiredDares) {
    for (const img of dare.images) {
      if (img.filename !== "default" && img.public_id) {
        await deleteImage(img.public_id);
      }
    }
  }

  await Dare.deleteMany({
    _id: { $in: expiredDares.map(d => d._id) }
  });
};

exports.deleteExpiredTasks = async () => {
  const expiredTasks = await Task.find({
    $expr: {
      $gt: [
        {
          $subtract: [
            Date.now(),
            { $toLong: "$createdAt" }
          ]
        },
        { $multiply: ["$timeLine", 60 * 1000] }
      ]
    }
  });

  for (const task of expiredTasks) {
    for (const img of task.images) {
      if (img.filename !== "default" && img.public_id) {
        await deleteImage(img.public_id);
      }
    }
  }

  await Task.deleteMany({
    _id: { $in: expiredTasks.map(t => t._id) }
  });
};