const User = require("../models/User");

exports.getProfileInfo = async (req, res) => {

    try {
        let person = await User.findOne({ username: req.params.person });
        if (!person) {
            return res.json({ error: true, message: "user not found" });
        }
        person = ({
            username: person.username,
            name: person.name,
            tasks: person.tasks.length,
            dares: person.challenges.length,
            profession: person.profession,
            links: person.links,
            streek: person.streek,
            friends: person.friends.length,
            bio: person.bio,
            pic: person.photo,
            cover:person.cover,


        })

        return res.json({ error: false, person });
    } catch (e) {
        consolr.log("error while fetching profile details : ", e);
        return res.json({ error: true, message: "Sever side error." });

    }

}