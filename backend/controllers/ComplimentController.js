const Compliment = require("../models/Compliment");
const Notification = require("../models/Notification");
// Creating a new compliment
const createCompliment = async (req, res) => {
    try {
        const compliment = await Compliment.create(req.body);

        res.status(201).json(compliment);

    } catch (error) {

    console.error("CREATE COMPLIMENT ERROR:", error);

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
const searchCompliments = async (req,res) => {
    try{
        const { keyword } = req.query;
        // if there is no such keyword then return all compliment
        if(!keyword || keyword.trim() === ""){
            const compliments = await Compliment.find()
            .sort ({createdAt: -1});
            return res.status(200).json(compliments);
        } 
        const compliments = await Compliment.find({
            $or: [
                {
                    to: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    message: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    mood: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
            ]
        }). sort ({createdAt: -1});
         res.status(200).json(compliments)
    } catch (error){
        res.status(500).json({
            message: "failed to searrch compliments",
            error: error.message
        })
       
    }
}

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
        //emoji for the notification
        const reactionEmojis = {
            heart: "❤️",
            smile: "😊",
            clap: "👏"
        };
        //create notification for the person who created the compliment
        await Notification.create({
            recipient: compliment.createdBy,
            type:"reaction",
            emoji: reactionEmojis[reaction],
            message: `Someone reacted ${reactionEmojis[reaction]} to your compliment.`,
            complimentId: compliment._id,
        });
        res.status(200).json(compliment);
    } catch(error) {
        res.status(500).json({
            message: "Failed to add reaction",
            error: error.message
        });
    }
};
const replyToCompliment = async (req, res) => {
    try {
        const { text, repliedBy,repliedTo } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Reply text is required",
            });
        }

        const compliment = await Compliment.findById(req.params.id);

        if (!compliment) {
            return res.status(404).json({
                message: "Compliment not found",
            });
        }

        compliment.replies.push({
            text: text.trim(),
            repliedBy: repliedBy || null,
            repliedTo: repliedTo || null,
        });

        await compliment.save();

        // Create notification for the person who posted the compliment
        // Don't notify them if they replied to their own compliment.
        const notificationRecipient = repliedTo || compliment.createdBy;

if (
    notificationRecipient &&
    (!repliedBy ||
        notificationRecipient.toString() !== repliedBy.toString())
) {
    await Notification.create({
        recipient: notificationRecipient,
        type: "reply",
        message: "Someone replied to your compliment 💌",
        complimentId: compliment._id
    });
}
        res.status(201).json({
            message: "Reply added successfully",
            compliment,
        });
    } catch (error) {
        console.error("REPLY ERROR:", error);

        res.status(500).json({
            message: "Failed to add reply",
            error: error.message,
        });
    }
};


module.exports = {
    createCompliment,
    getCompliments,
    searchCompliments,
    addReaction,
    replyToCompliment
};