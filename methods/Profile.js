const User = require("../models/User");
const Frnd = require("../models/Frnd");

exports.getProfileInfo = async (req, res) => {
    const { person: per } = req.params;
    let sts = 0;
    try {
        let person = await User.findOne({ username: per });
        if (!person) {
            return res.json({ error: true, message: "user not found" });
        }

        // 
        if (person._id == req.user.id) {
            const frnd = await Frnd.find({
                $or: [
                    { frnd1: req.user.id, status: "accepted" },
                    { frnd2: req.user.id, status: "accepted" }
                ]
            });
            sts = frnd.length;
        } else {
            const myFrnd = await Frnd.findOne({
                $or: [
                    { frnd1: req.user.id, frnd2: person._id },
                    { frnd1: person._id, frnd2: req.user.id }
                ]
            });

            if (!myFrnd) {
                sts = "+ Friends";

            } else {
                if (myFrnd.frnd1 == req.user.id) {
                    if (myFrnd.status == "accepted") {
                        sts = "Remove";
                    } else {
                        sts = "Pending";
                    }
                } else {
                    if (myFrnd.status == "accepted") {
                        sts = "Remove";
                    } else {
                        sts = "Accept";
                    }
                }

            }
        }

        person = ({
            username: person.username,
            id: person._id,
            iAm: req.user.id,
            name: person.name,
            tasks: person.tasks.length,
            dares: person.challenges.length,
            profession: person.profession,
            links: person.links,
            streek: person.streek,
            friends: sts,
            bio: person.bio,
            pic: person.photo,
            cover: person.cover,
            merit: person.merit,


        })

        return res.json({ error: false, person });
    } catch (e) {
        console.log("error while fetching profile details : ", e);
        return res.json({ error: true, message: "Sever side error." });

    }

}


exports.addOneLink = async (req, res) => {
    try {
        const { title, url, type } = req.body;
        if (!title || title.length > 20) {
            return res.send({ error: true, message: "Invalid title (max 20 chars)" });
        }
        if (!url) {
            return res.send({ error: true, message: "URL is required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.send({ error: true, message: "User not found" });

        const index = user.links.findIndex(link => link.type === type);

        const newLink = {
            goto: url,
            title,
            type,
            addedAt: Date.now()
        };

        if (index !== -1) {
            user.links[index] = newLink;
        } else {
            user.links.push(newLink);
        }

        await user.save();

        res.send({
            error: false,
            message: index !== -1 ? "Link updated" : "Link added",
            links: user.links
        });

    } catch (err) {
        console.log(err);
        res.send({ error: true, message: "Server error" });
    }
};


exports.removeLink = async (req, res) => {
    try {
        const linkId = req.params.id;
        const userId = req.user.id;


        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { links: { _id: linkId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        res.json({ error: false, message: "Link removed successfully", links: user.links });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Something went wrong" });
    }
}

exports.frndReq = async (req, res) => {
    const { frndId } = req.params;

    try {
        const frnd = await Frnd.findOne({
            $or: [
                { frnd1: req.user.id, frnd2: frndId },
                { frnd1: frndId, frnd2: req.user.id }
            ]
        });

        if (!frnd) {
            await Frnd.create({
                frnd1: req.user.id,
                frnd2: frndId,
                status: "pending",
            });
            return res.send({ error: false, info: "Pending", msg: "Request Sended." });
        } else {
            if (frnd.frnd1 == req.user.id) {
                if (frnd.status == "accepted") {
                    await Frnd.deleteOne({ frnd1: req.user.id, frnd2: frndId });
                    return res.send({ error: false, info: "+ Friend", msg: "Unfriend." });
                } else {
                    await Frnd.deleteOne({ frnd1: req.user.id, frnd2: frndId });
                    return res.send({ error: false, info: "+ Friend", msg: "Request withdraw." });
                }

            } else {
                if (frnd.status == "accepted") {
                    await Frnd.deleteOne({ frnd2: req.user.id, frnd1: frndId });
                    console.log("unfriend");
                    return res.send({ error: false, info: "+ Friend", msg: "Unfriend." });
                } else {
                    frnd.status = "accepted";
                    frnd.save();
                    return res.send({ error: false, info: "Remove", msg: "Request accepeted." });
                }
            }
        }
    } catch (er) {
        console.log("error in frnd req : ", er);
        return res.send({ error: true, msg: "Server side error." })
    }
}

exports.getMyfrnd = async (req, res) => {
    try {
        let friends = await Frnd.find({
            $or: [
                { frnd1: req.user.id, status: "accepted" },
                { frnd2: req.user.id, status: "accepted" }
            ]
        })
            .populate("frnd1")
            .populate("frnd2");

        // Convert to only actual friend user
        friends = friends.map(one => {
            const isFrnd1 = one.frnd1._id.toString() === req.user.id;

            const other = isFrnd1 ? one.frnd2 : one.frnd1;

            return {
                id: other._id,
                pic: other.photo,
                username: other.username,
                name: other.name
            };
        });

        return res.send({ error: false, friends, msg: "All friends list" });

    } catch (er) {
        console.log("error in frnd req : ", er);
        return res.send({ error: true, msg: "Server side error." })
    }
}