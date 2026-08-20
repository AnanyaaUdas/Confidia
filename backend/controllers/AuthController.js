const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



// GENERATE ANONYMOUS USERNAME


const generateUsername = async () => {

    const adjectives = [
        "Kind",
        "Happy",
        "Gentle",
        "Bright",
        "Warm",
        "Sweet",
        "Lovely",
        "Calm",
        "Caring",
        "Friendly",
    ];

    const nouns = [
        "Heart",
        "Soul",
        "Flower",
        "Star",
        "Smile",
        "Cloud",
        "Sunshine",
        "Friend",
        "Dreamer",
        "Butterfly",
    ];

    let username;
    let exists = true;

    while (exists) {

        const adjective =
            adjectives[
                Math.floor(
                    Math.random() * adjectives.length
                )
            ];

        const noun =
            nouns[
                Math.floor(
                    Math.random() * nouns.length
                )
            ];

        const number =
            Math.floor(
                1000 + Math.random() * 9000
            );

        username =
            `${adjective}_${noun}${number}`;


        const existingUser =
            await User.findOne({
                username,
            });


        exists = !!existingUser;
    }

    return username;
};



// REGISTER


const registerUser = async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body;


        // Check email
        const existingEmail =
            await User.findOne({
                email,
            });


        if (existingEmail) {

            return res.status(400).json({
                message: "Email already exists",
            });

        }


        // Generate anonymous username
        const username =
            await generateUsername();


        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Create user
        const user =
            await User.create({

                firstName,

                lastName,

                username,

                email,

                password:
                    hashedPassword,

            });


        res.status(201).json({

            message:
                "Registration successful",

            user: {

                id: user._id,

                firstName:
                    user.firstName,

                lastName:
                    user.lastName,

                username:
                    user.username,

                email:
                    user.email,

                complimentsShared:
                    user.complimentsShared,

                reactionsGiven:
                    user.reactionGiven,

                dayStreak:
                    user.dayStreak,

                memberSince:
                    user.memberSince,
            },

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            message: "Server error",
        });

    }
};



// LOGIN


const loginUser = async (req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;


        // Find user
        const user =
            await User.findOne({
                email,
            });


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid email or password",

            });

        }


        // Check password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(400).json({

                message:
                    "Invalid email or password",

            });

        }
        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );


        // Successful login
        res.status(200).json({

            message:
                "Login successful",
                token,

            user: {

                id: user._id,

                firstName:
                    user.firstName,

                lastName:
                    user.lastName,

                username:
                    user.username,

                email:
                    user.email,

                complimentsShared:
                    user.complimentsShared,

                reactionsGiven:
                    user.reactionGiven,

                dayStreak:
                    user.dayStreak,

                memberSince:
                    user.memberSince,

            },

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            message:
                "Server error",

        });

    }
};


module.exports = {
    registerUser,
    loginUser,
};