const express = require("express");

const router = express.Router();

const {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");

// POST /api/reports

router.post("/", createReport);

// GET /api/reports

router.get("/", getReports);

// PATCH /api/reports/:id/status

router.patch("/:id/status", updateReportStatus);

// DELETE /api/reports/:id

router.delete("/:id", deleteReport);

module.exports = router;
