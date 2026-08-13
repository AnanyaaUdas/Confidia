const Compliment = require("../models/Compliment");

// Creating a new compliment
const createCompliment = async (req, res) => {
    try {
        const compliment = await Compliment.create(req.body);

        res.status(201).json(compliment);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create compliment",
            error: error.message
        });
    }
};


// Get all compliments
const getCompliments = async (req, res) => {
    try {
        const compliments = await Compliment.find()
            .sort({ createdAt: -1 });

        res.status(200).json(compliments);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get compliments",
            error: error.message
        });
    }
};

//add a reaction to a compliment
const addReaction = async (req,res) => {
    try{
        const {reaction} = req.body;
        const compliment = await Compliment.findById(req.params.id);
        if(!compliment) {
            return res.status(404).json({
                message: "Compliment not found"
            });
        }

        if(!["heart","smile","clap"].includes(reaction)){
            return res.status(400).json({
                message: "Invalid reaction"
            })
        }
        compliment.reactions[reaction] +=1;
        await compliment.save();
        res.status(200).json(compliment);
    } catch(error) {
        res.status(500).json({
            message: "Failed to add reaction",
            error: error.message
        });
    }
};


module.exports = {
    createCompliment,
    getCompliments,
    addReaction
};