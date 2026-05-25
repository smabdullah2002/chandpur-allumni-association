const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    headline: { type: String, trim: true, default: "" },
    subtext: { type: String, trim: true, default: "" },
    ctaText: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["visible", "hidden"], default: "visible" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slider", sliderSchema);
