require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB =
    require("./config/db");

const complimentRoutes =
    require("./routes/complimentRoutes");

const authRoutes =
    require("./routes/AuthRoutes");

const notificationRoutes =
    require("./routes/NotificationRoutes");

const reportRoutes =
    require("./routes/reportRoutes");

const app =
    express();

// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin:
            "http://localhost:5173",
    })
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    express.json()
);

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// ROUTES
// =====================================================

app.use(
    "/api/compliments",
    complimentRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/reports",
    reportRoutes
);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message:
            "Confidia backend is running!",
    });
});

// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);