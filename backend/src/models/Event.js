const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    date: { type: Date, required: true },
    location: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["upcoming", "past", "cancelled"], default: "upcoming" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    noticeRef: { type: mongoose.Schema.Types.ObjectId, ref: "Notice", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);