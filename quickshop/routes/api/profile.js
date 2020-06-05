const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../model/Profile");
const User = require("../../model/Users");

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        }).populate("user", ["username", "avatar"]);

        if (!profile) {
            return res
                .status(400)
                .json({ msg: "There is no profile for this user." });
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.post(
    "/",
    [
        auth,
        [
            check("username", "Username is required").not().isEmpty(),
            check("bio", "Tell us about your self?").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            location,
            bio,
            jobtitle,
            twitter,
            facebook,
            instagram
        } = req.body;

        //build profile object


        const profileFields = {};
        profileFields.user = req.user.id;
        if (location) profileFields.location = location;
        if (jobtitle) profileFields.jobtitle = jobtitle;
        if (bio) profileFields.bio = bio;

        profileFields.social = {};
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (instagram) profileFields.social.instagram = instagram;





        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {


                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');

        }
    }
);

router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['username', 'avatar']);
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }

}

)


module.exports = router;