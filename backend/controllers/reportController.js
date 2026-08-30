const Report = require("../models/Report");
const Compliment = require("../models/Compliment");

exports.createReport = async (req, res) => {
  try {
    const { complimentId, reportedBy, reason } = req.body;

    if (!complimentId) {
      return res.status(400).json({
        message: "Compliment ID is required",
      });
    }

    const compliment = await Compliment.findById(complimentId);

    if (!compliment) {
      return res.status(404).json({
        message: "Compliment not found",
      });
    }

    const existingReport = await Report.findOne({
      complimentId,
      reportedBy: reportedBy || null,
      status: "pending",
    });

    if (existingReport) {
      return res.status(400).json({
        message: "You have already reported this compliment.",
      });
    }

    const report = await Report.create({
      complimentId,
      reportedBy: reportedBy || null,
      reason: reason || "Reported by user",
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to submit report",
      error: error.message,
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("complimentId")
      .populate("reportedBy", "name username email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(reports);
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load reports",
      error: error.message,
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const allowedStatuses = ["pending", "reviewed", "resolved", "dismissed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid report status",
      });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report status updated",
      report,
    });
  } catch (error) {
    console.error("UPDATE REPORT STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update report status",
      error: error.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete report",
      error: error.message,
    });
  }
};
