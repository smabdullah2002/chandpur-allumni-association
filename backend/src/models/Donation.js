const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, trim: true, default: "" },
    amount:   { type: Number, required: true, min: 0 },
    donationDate: { type: Date, required: true },
    transactionId: { type: String, trim: true, default: "" },
    message:  { type: String, trim: true, default: "" },
    receipt:  { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);