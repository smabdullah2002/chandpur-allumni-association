const mongoose = require("mongoose");

const feeCategorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    amount:      { type: Number, required: true, min: 0 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeCategory", feeCategorySchema);