const mongoose = require("mongoose");

const aboutStatSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true, default: "" },
    label: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const aboutSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    body: { type: String, trim: true, default: "" },
    trustPoints: { type: [String], default: [] },
    stats: { type: [aboutStatSchema], default: [] },
    members: { type: String, trim: true, default: "" },
    lifetimeMembers: { type: String, trim: true, default: "" },
    committee: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", aboutSchema);
