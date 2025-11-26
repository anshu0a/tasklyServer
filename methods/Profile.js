const User = require("../models/User");

exports.getProfileInfo = async (req, res) => {

    try {
        let person = await User.findOne({ username: req.params.person });
        if (!person) {
            return res.json({ error: true, message: "user not found" });
        }
        person = ({
            username: person.username,
            id:person._id,
            iAm:req.user.id,
            name: person.name,
            tasks: person.tasks.length,
            dares: person.challenges.length,
            profession: person.profession,
            links: person.links,
            streek: person.streek,
            friends: person.friends.length,
            bio: person.bio,
            pic: person.photo,
            cover: person.cover,


        })

        return res.json({ error: false, person });
    } catch (e) {
        consolr.log("error while fetching profile details : ", e);
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