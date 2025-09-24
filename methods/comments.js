
const User = require("../models/User");
const Task = require("../models/Task");

exports.addComment = async (req, res) => {
  try {
    const { search } = req.params;
    const { post: postId, owner: ownerId, message } = req.body;

    if (!message || !postId || !ownerId) {
      return res.status(400).json({ error: true, message: "Missing required fields" });
    }

    // Decide where to add comment
    let targetUserId;
    if (search === "public") {
      targetUserId = ownerId; // comment goes into owner's tasks
    } else if (search === "personal") {
      targetUserId = req.user.id; // comment goes into logged-in user's tasks
    } else {
      return res.status(400).json({ error: true, message: "Invalid search type" });
    }

    // Find the user who holds the task
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: true, message: "Target user not found" });
    }

    // Find the specific task
    const task = user.tasks.id(postId);
    if (!task) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    // Add comment
    task.cmt.push({
      msg: message,
      person: req.user.id, // commenter is always the current logged-in user
    });

    await user.save();

    // Repopulate comments with user info
    const populatedUser = await User.findById(targetUserId)
      .select("tasks")
      .populate("tasks.cmt.person", "username photo _id");

    const updatedTask = populatedUser.tasks.id(postId);

    const sortedCmt = updatedTask.cmt.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      error: false,
      message: "Comment added",
      data: sortedCmt,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};


exports.removeComment = async (req, res) => {
  try {
    const { userId, taskId, msgId, search } = req.params;

    let targetUserId;
    if (search === "personal") {
      targetUserId = req.user.id; 
    } else if (search === "public") {
      targetUserId = userId; 
    } else {
      return res.status(400).json({ error: true, message: "Invalid search type" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: targetUserId, "tasks._id": taskId },
      { $pull: { "tasks.$.cmt": { _id: msgId } } },
      { new: true }
    ).populate("tasks.cmt.person", "username photo _id");

    if (!updatedUser) {
      return res.status(404).json({ error: true, message: "User or task not found" });
    }

    res.json({
      error: false,
      message: "Comment removed successfully",
      tasks: updatedUser.tasks.id(taskId).cmt,
    });
  } catch (err) {
    console.error("Error removing comment:", err);
    res.status(500).json({ error: true, message: "Server error" });
  }
};
