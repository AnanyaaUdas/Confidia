require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const complimentRoutes = require("./routes/complimentRoutes");

const app = express();

app.use(cors({
    origin:"http://localhost:5173"
}));
app.use(express.json());

connectDB();

app.use("/api/compliments", complimentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Confidia backend is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});