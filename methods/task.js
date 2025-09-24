const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const { uploadMultipleImages, deleteImage } = require("../config/cloudnary.js");

exports.addTask = async (req, res) => {
  try {
    let images = [];
    let voices = [];

    // validate required fields
    if (!req.body.title?.trim() || !req.body.purpose?.trim()) {
      return res.send({ error: true, message: "Missing title or purpose." });
    }

    // Handle images
    if (req.files?.images?.length > 0) {
      images = await uploadMultipleImages(req.files.images);
    }

    // Handle voice
    if (req.files?.voice?.length > 0) {
      voices.push({
        filename: req.files.voice[0].originalname,
        data: req.files.voice[0].buffer,
        contentType: req.files.voice[0].mimetype,
        uploadedAt: new Date(),
      });
    }

    // timeline
    let days = parseInt(req.body.timeLine, 10);
    if (!days || days <= 0) days = 1;

    // create task object
    const newTaskData = {
      owner: req.user.id,
      title: req.body.title.trim(),
      purpose: req.body.purpose.trim(),
      priority: req.body.priority,
      type: req.body.type,
      about: req.body.about?.trim() || undefined,
      timeLine: days,
      voices: voices.length > 0 ? voices : undefined,
      images: images.length > 0 ? images : undefined,
    };

    const newTask = new Task(newTaskData);
    await newTask.save();

    // push task to user (with proper object shape)
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { tasks: { _id: newTask._id } } },  // ✅ FIXED
      { new: true }
    );

    res.send({ error: false, message: "Task added." });
  } catch (err) {
    console.error(err);
    res.send({ error: true, message: err.message || "Error while adding task." });
  }
};


exports.istaskName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    if (!title) return res.send({ error: true, message: "Task title is required" });

    const user = await User.findById(userId);
    if (!user) return res.send({ error: true, message: "User not found" });

    const taskIds = user.tasks.map(t => t._id);
    const exists = await Task.exists({ _id: { $in: taskIds }, title });

    res.send({ error: false, exists: !!exists });
  } catch (err) {
    console.error(err);
    res.send({ error: true, message: "error in searching title." });
  }

}

exports.getmydata = exports.getmydata = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "tasks._id",
        populate: { path: "owner", select: "username photo" }
      })
      .select("tasks");

    if (!user) return res.status(404).json({ error: true, message: "User not found" });

    // Remove duplicates (if any)
    const seenIds = new Set();
    const uniqueTasks = user.tasks.filter(t => {
      const id = t._id?.toString();
      if (!id || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    // Sort strictly by addedAt descending
    const sortedTasks = uniqueTasks.sort(
      (a, b) => new Date(a.addedAt) - new Date(b.addedAt)
    );

    const data = sortedTasks.map(taskEntry => {
      const task = taskEntry._id;

      if (!task) {
        // Placeholder for deleted/missing tasks
        return { deleted: true, addedAt: taskEntry.addedAt };
      }

      return {
        owner: {
          name: task.owner?.username || "Unknown",
          pic: task.owner?.photo || null
        },
        task: {
          _id: task._id,
          title: task.title,
          purpose: task.purpose,
          timeLine: task.timeLine,
          img: task.images?.[0]?.path || null,
          imgFilename: task.images?.[0]?.filename || null,
          createdAt: task.createdAt,
          views: (task.views || []).map(v => v._id?.toString())
        },
        addedAt: taskEntry.addedAt
      };
    });

    res.json({ error: false, data, user: req.user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};





exports.getOtherTasks = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("tasks");
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const excludeIds = user.tasks.map(t => t._id);
    const tasks = await Task.find({
      owner: { $ne: req.user.id },
      _id: { $nin: excludeIds },
      type: "public"
    })
      .sort({ createdAt: 1 })
      .populate("owner", "username photo");


    const data = tasks.map(task => ({
      owner: {
        name: task.owner?.username || "Unknown",
        pic: task.owner?.photo || null
      },
      task: {
        _id: task._id,
        title: task.title,
        purpose: task.purpose,
        timeLine: task.timeLine,
        img: task.images?.[0]?.path || null,
        createdAt: task.createdAt,
        views: (task.views || []).map(v => v._id?.toString())
      }
    }));

    res.json({ error: false, data, user: req.user.username });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};

exports.pullPushTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: true, message: "User not found" });

    const taskObjectId = new mongoose.Types.ObjectId(taskId);

    const taskExists = user.tasks.some(
      (t) => t._id && t._id.toString() === taskObjectId.toString()
    );

    if (taskExists) {
      await User.findByIdAndUpdate(userId, {
        $pull: { tasks: { _id: taskObjectId } }
      });

      await Task.findByIdAndUpdate(taskId, { $inc: { grab: -1 } });

      return res.json({ error: false, message: "Task removed" });
    } else {

      await User.findByIdAndUpdate(userId, {
        $addToSet: { tasks: { _id: taskObjectId, addedAt: new Date() } }
      });


      await Task.findByIdAndUpdate(taskId, { $inc: { grab: 1 } });

      return res.json({ error: false, message: "Task added" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};


exports.getOneTask = async (req, res) => {
  try {
    const { taskId, search } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: true, message: "Invalid Task ID" });
    }

    const task = await Task.findById(taskId).populate("owner", "username name photo _id");

    if (!task) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    // --- Add current user to task.views if not already present ---
    if (!task.views.some(v => v._id.toString() === req.user.id)) {
      task.views.push({ _id: req.user.id });
      await task.save();
    }

    // --- Determine which user's task list to use ---
    let userWithTask;
    let taskInfo;

    if (search === "public") {
      userWithTask = await User.findById(task.owner._id).lean();
    } else if (search === "presonal") {
      userWithTask = await User.findById(req.user.id).lean();
    }

    if (userWithTask) {
      taskInfo = userWithTask.tasks.find(
        (t) => t._id.toString() === taskId.toString()
      );
    }

    if (!taskInfo) {
      return res.json({
        error: false,
        task,
        extra: null,
        user: req.user.id,
      });
    }

    // Populate comments with user info
    await User.populate(taskInfo.cmt, {
      path: "person",
      select: "username name photo _id"
    });

    res.json({
      error: false,
      task,
      extra: taskInfo,
      user: req.user.id,
    });

  } catch (err) {
    console.error("getOneTask error:", err.message);
    res.status(500).json({ error: true, message: "Server error" });
  }
};



exports.markDone = async (req, res) => {
  try {
    const { mth, ownerId } = req.body;
    const { taskId, search } = req.params;

    let targetUserId;
    if (search === "personal") {
      targetUserId = req.user.id;
    } else if (search === "public") {
      targetUserId = ownerId;
    } else {
      return res.status(400).json({ error: true, message: "Invalid search type" });
    }

    const user = await User.findOneAndUpdate(
      { _id: targetUserId, "tasks._id": taskId },
      { $set: { "tasks.$.isDone": mth } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    const msgg = mth ? "Marked as complete" : "Marked as incomplete";
    res.json({ error: false, message: msgg });
  } catch (err) {
    console.error("Error marking task done:", err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};


exports.addOneMinute = async (req, res) => {
  try {
    console.log("timer come")
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: true, message: "Task ID is required" });
    }

    const user = await User.findOne({ _id: req.user.id, "tasks._id": taskId });

    if (!user) {
      return res.status(404).json({ error: true, message: "User or task not found" });
    }

    const task = user.tasks.id(taskId);
    task.spend = (task.spend || 0) + 0.0167;
    await user.save();

    res.json({
      error: false,
      message: "Task spend updated",
      spend: task.spend,
    });
  } catch (err) {
    console.error("Error updating task spend:", err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};





exports.killTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: true, message: "Invalid Task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }


    if (task.owner.toString() === req.user.id) {
      if (task.images && task.images.length > 0) {
        for (const img of task.images) {
          if (img.filename !== "default" && img.public_id) {
            try {
              await deleteImage(img.public_id);
            } catch (err) {
              console.error(`Failed to delete image ${img.public_id}:`, err);
            }
          }
        }
      }


      await User.updateMany(
        { "tasks._id": taskId },
        { $pull: { tasks: { _id: taskId } } }
      );

      await Task.findByIdAndDelete(taskId);

      return res.json({
        error: false,
        message: "Task deleted successfully along with images and removed from all users",
      });
    }
    else {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { tasks: { _id: taskId } } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: true, message: "User not found" });
      }


      task.grab = Math.max(0, task.grab - 1);
      await task.save();

      return res.json({
        error: false,
        message: "Task removed from your tasks and grab decremented",
        tasks: updatedUser.tasks,
        grab: task.grab,
      });
    }

  } catch (err) {
    console.error("Error killing task:", err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};
