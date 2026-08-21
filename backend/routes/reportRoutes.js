const express = require("express");

const router =
    express.Router();

const {
    createReport,
    getReports,
    updateReportStatus,
    deleteReport,
} = require(
    "../controllers/reportController"
);

// =====================================================
// CREATE REPORT
// POST /api/reports
// =====================================================

router.post(
    "/",
    createReport
);

// =====================================================
// GET ALL REPORTS
// GET /api/reports
// =====================================================

router.get(
    "/",
    getReports
);

// =====================================================
// UPDATE REPORT STATUS
// PATCH /api/reports/:id/status
// =====================================================

router.patch(
    "/:id/status",
    updateReportStatus
);

// =====================================================
// DELETE REPORT
// DELETE /api/reports/:id
// =====================================================

router.delete(
    "/:id",
    deleteReport
);

module.exports =
    router;