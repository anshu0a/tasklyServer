const Dare = require("../models/Dare");
const Task = require("../models/Task");

exports.deleteExpiredDares = async () => {
    await Dare.deleteMany({
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
};


exports.deleteExpiredTasks = async () => {
    await Task.deleteMany({
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
};

