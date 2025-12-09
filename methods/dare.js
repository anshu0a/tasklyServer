const User = require("../models/User");
const Dare = require("../models/Dare");
const { isNewDay } = require("../help/isNewday.js");
const { uploadMultipleImages, deleteImage } = require("../config/cloudnary.js");

exports.addOneDare = async (req, res) => {
    try {
        let images = [];
        let voices = [];

        if (!req.body.title?.trim() || !req.body.purpose?.trim()) {
            return res.send({ error: true, message: "Missing title or purpose." });
        }

        if (req.files?.images?.length > 0) {
            images = await uploadMultipleImages(req.files.images);
        }

        if (req.files?.voice?.length > 0) {
            voices.push({
                filename: req.files.voice[0].originalname,
                data: req.files.voice[0].buffer,
                contentType: req.files.voice[0].mimetype,
                uploadedAt: new Date(),
            });
        }

        let collabArray = [];
        if (req.body.collab) {
            try {
                collabArray = JSON.parse(req.body.collab);
            } catch {
                collabArray = [];
            }
        }

        const collabData = collabArray.map(id => ({
            _id: id.toString(),
            agree: false
        }));

        let days = parseInt(req.body.timeLine, 10);
        if (!days || days <= 0) days = 7;

        let allDaresArray = [];

        if (req.body.allDares) {
            if (Array.isArray(req.body.allDares)) {
                if (
                    req.body.allDares.length === 1 &&
                    typeof req.body.allDares[0] === "string" &&
                    req.body.allDares[0].startsWith("[")
                ) {
                    try {
                        allDaresArray = JSON.parse(req.body.allDares[0]);
                    } catch {
                        allDaresArray = [];
                    }
                } else {
                    allDaresArray = req.body.allDares;
                }
            } else if (typeof req.body.allDares === "string") {
                try {
                    allDaresArray = JSON.parse(req.body.allDares);
                } catch {
                    allDaresArray = [];
                }
            }
        }

        const formattedAllDares = allDaresArray.map(item => ({
            one: String(item),
            isDone: false
        }));
        const newDareData = {
            admin: req.user.id,
            title: req.body.title.trim(),
            purpose: req.body.purpose.trim(),
            priority: Number(req.body.priority) || 75,
            type: req.body.type || "personal",
            days: req.body.timeLine,
            desc: req.body.about?.trim() || undefined,
            timeLine: days,
            voices: voices.length > 0 ? voices : undefined,
            images: images.length > 0 ? images : undefined,
            allDares: formattedAllDares,
            collab: collabData,
        };

        const newDare = await Dare.create(newDareData);

        await User.updateOne(
            {
                _id: req.user.id,
                "challenges.dare": { $ne: newDare._id }
            },
            {
                $push: {
                    challenges: {
                        dare: newDare._id,
                        addedAt: new Date(),
                        progress: 0,
                        streek: 0,
                        by: 'm',
                        allDares: JSON.parse(JSON.stringify(formattedAllDares)),
                    }
                }
            }
        );

        if (collabArray.length > 0) {
            await User.updateMany(
                {
                    _id: { $in: collabArray },
                    "challenges.dare": { $ne: newDare._id }
                },
                {
                    $push: {
                        challenges: {
                            dare: newDare._id,
                            addedAt: new Date(),
                            progress: 0,
                            streek: 0,
                            by: 'c',
                            allDares: JSON.parse(JSON.stringify(formattedAllDares)),
                        }
                    }
                }
            );
        }

        res.send({ error: false, message: "dare added." });

    } catch (err) {
        console.error(err);
        res.send({ error: true, message: err.message || "Error while adding dare." });
    }
};



exports.getMyChallenges = async (req, res) => {
    try {
        const myUser = await User.findById(req.user.id)
            .populate({
                path: "challenges.dare",
                select: "_id title admin purpose video createdAt days",
                populate: {
                    path: "admin",
                    select: "_id username photo"
                }
            });

        if (!myUser) return res.send({ error: true, msg: "User not found" });

        const dares = myUser.challenges.map(c => ({
            _id: c.dare._id,
            title: c.dare.title,
            admin: c.dare.admin, // { _id, username, photo }
            purpose: c.dare.purpose,
            video: c.dare.video,
            createdAt: c.dare.createdAt,
            days: c.dare.days,
            progress: c.progress,
            streek: c.streek,
            addedAt: c.addedAt
        }));

        res.send({ error: false, dares });


    } catch (err) {
        res.send({ error: true, msg: "Something went wrong" });
    }
}



exports.getOtherChallenges = async (req, res) => {
    try {

        const myUser = await User.findById(req.user.id)
            .populate({
                path: "challenges.dare",
                select: "_id"
            });

        if (!myUser)
            return res.send({ error: true, msg: "User not found" });


        const myDareIds = myUser.challenges
            .map(c => c?.dare?._id)
            .filter(Boolean);

        const dares = await Dare.find({
            _id: { $nin: myDareIds },
            type: { $ne: "personal" }
        })
            .select("_id title admin purpose video createdAt days type")
            .populate("admin", "_id username photo");

        return res.send({
            error: false,
            dares
        });

    } catch (err) {
        console.error(err);
        return res.send({ error: true, msg: "Something went wrong" });
    }
};


exports.oneDare = async (req, res) => {
    try {
        const { dareId, type } = req.params;

        let mydare = await Dare.findByIdAndUpdate(
            dareId,
            { $addToSet: { views: req.user.id } },
            { new: true }
        )
            .populate("admin", "_id username name photo cover")
            .populate("collab._id", "_id username name photo");

        if (type === "public") {

            if (!mydare) {
                return res.send({ error: true, found: false, msg: "Dare not found" });
            }

            return res.send({ error: false, dare: mydare });
        }

        const myUser = await User.findById(req.user.id)
            .populate({
                path: "challenges.dare",
                populate: [
                    { path: "admin", select: "_id username name photo cover" },
                    { path: "collab._id", select: "_id username name photo" }
                ]
            });

        if (!myUser) {
            return res.send({ error: true, msg: "User not found" });
        }

        const dare = myUser.challenges.find(
            c => c.dare && c.dare._id.toString() === dareId
        );
        if (!dare) {
            return res.send({ error: true, found: false, msg: "Dare not found in user challenges" });
        }

        const now = new Date();
        const last = dare.lastDone ? new Date(dare.lastDone) : null;



        if (isNewDay(last) && isNewDay(dare.lastAction)) {
            dare.allDares.forEach(d => d.isDone = false);

            if (last) {
                const diffDays = Math.floor((now - last) / (24 * 60 * 60 * 1000));

                if (diffDays > 1) {
                    if (dare.streek !== 0 && myUser.merit !== 0) {
                        myUser.merit -= 11;
                    }
                    dare.streek = 0;
                }
            }
        }

        await myUser.save();
        res.send({ error: false, dare });
    } catch (er) {

        if (er.message.includes("Cast to ObjectId failed"))
            res.send({ error: true, found: false, message: "Dare not found" });
        else res.send({ error: true, message: "Server side error." });
    }
};

exports.grabDare = async (req, res) => {
    try {
        const { dareId } = req.params;

        const me = await User.findById(req.user.id);
        if (!me) return res.send({ error: true, message: "User not found" });

        const dareok = await Dare.findById(dareId);
        if (!dareok) return res.send({ error: true, message: "Dare not exist" });

        const alreadyInMyChallenges = me.challenges.some(
            item => item.dare.toString() === dareId
        );

        if (alreadyInMyChallenges) {
            return res.send({ error: true, message: "Dare already exist" });
        }

        const alreadyGrabbed = dareok.grab.some(
            id => id.toString() === req.user.id
        );

        if (!alreadyGrabbed) {
            dareok.grab.push(req.user.id);
            await dareok.save();
        }

        me.challenges.push({
            dare: dareId,
            by: 'g',
            allDares: JSON.parse(JSON.stringify(dareok.allDares))
        });

        await me.save();

        res.send({ error: false, message: "Dare grabbed in private." });

    } catch (er) {
        res.send({ error: true, message: "Server side error." });
    }
};


exports.deleteDare = async (req, res) => {
    try {
        const { dareId, type } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.send({ error: true, message: "User not found" });
        }

        const removed = user.challenges.some(
            item => item.dare.toString() === dareId.toString()
        );

        if (!removed) {
            return res.send({ error: true, message: "Dare not found in user challenges" });
        }

        if (type === "g") {
            await Dare.findByIdAndUpdate(dareId, {
                $pull: { grab: userId }
            });

        } else if (type === "c") {
            await Dare.findByIdAndUpdate(dareId, {
                $pull: { collab: { _id: userId } }
            });

        } else if (type === "m") {
            const dare = await Dare.findById(dareId).select("collab grab images");

            if (!dare) {
                return res.send({ error: true, message: "Dare not found" });
            }

            const allUserIds = [
                ...dare.grab,
                ...dare.collab.map(c => c._id)
            ];

            await User.updateMany(
                { _id: { $in: allUserIds } },
                {
                    $pull: {
                        challenges: { dare: dareId }
                    }
                }
            );

            await Dare.findByIdAndUpdate(dareId, {
                $set: {
                    grab: [],
                    collab: []
                }
            });


            if (dare.images && dare.images.length > 0) {
                for (const img of dare.images) {
                    if (img.filename !== "default" && img.public_id) {
                        try {
                            await deleteImage(img.public_id);
                        } catch (err) {
                            console.error(`Failed to delete image ${img.public_id}:`, err);
                        }
                    }
                }
            }

            await Dare.findByIdAndDelete(dareId);

        }

        await User.findByIdAndUpdate(userId, {
            $pull: {
                challenges: { dare: dareId }
            }
        });

        res.send({ error: false, message: "Dare removed successfully" });

    } catch (err) {
        res.send({ error: true, message: "Server side error" });
    }
};


exports.markDare = async (req, res) => {
    try {
        const { dareId, oneId, work: isDone } = req.params;
        const userId = req.user.id;

        // First, make sure allDares exists
        const user = await User.findOne({
            _id: userId,
            "challenges.dare": dareId
        });

        if (!user) {
            return res.status(400).send({ error: true, message: "Challenge not found" });
        }

        const challenge = user.challenges.find(c => c.dare.toString() === dareId);

        challenge.lastAction = Date.now();
        // If allDares is missing, initialize it
        if (!challenge.allDares) {
            challenge.allDares = [];
        }

        await user.save();

        // Update the specific task
        const task = challenge.allDares.id(oneId);
        if (!task) {
            return res.status(400).send({ error: true, message: "Task not found" });
        }

        task.isDone = isDone;
        await user.save();

        res.send({ error: false, message: "Task updated", allDares: challenge.allDares });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: true, message: "Server error" });
    }
};


exports.updateStreek = async (req, res) => {
    try {
        const { dareId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.send({ error: true, message: "User not found" });

        // Find the challenge
        const dare = user.challenges.find(
            c => c.dare && c.dare.toString() === dareId
        );

        if (!dare) {
            return res.send({ error: true, message: "Dare not found in user challenges" });
        }

        const now = new Date();
        const last = dare.lastDone ? new Date(dare.lastDone) : null;

        // Check if it's a new day compared to lastDone
        const isNewDay = !last ||
            now.getFullYear() !== last.getFullYear() ||
            now.getMonth() !== last.getMonth() ||
            now.getDate() !== last.getDate();

        if (!isNewDay) {
            return res.send({ error: true, message: "Dare allready completed for today." });
        }
        dare.streek += 1;
        user.merit += 21;
        await user.save();

        dare.lastDone = now;

        await user.save();

        res.send({
            error: false,
            message: "Dare completed for today.",
            streek: dare.streek,
            allDares: dare.allDares
        });

    } catch (err) {
        console.error(err);
        res.send({ error: true, message: "Server error" });
    }
};
