const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'super-admin'], default: 'user' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    district: { type: String, default: 'Chandpur' },
    division: { type: String, default: 'Chittagong' },
    upazila: { type: String, trim: true },
    villageName: { type: String, trim: true },
    policeStation: { type: String, trim: true },
    mobileNumber: { type: String, trim: true },
    lastEducation: { type: String, trim: true },
    profession: { type: String, trim: true },
    presentAddress: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    dateOfBirth: { type: String },
    politicalAffiliation: { type: String, default: 'No' },
    profileImage: { type: String },
    certificateDocument: { type: String },
    nidDocument: { type: String },
    phonePublic: { type: Boolean, default: false },
    badge: {
      name:  { type: String, trim: true, default: '' },
      color: { type: String, trim: true, default: '' },
    },
    resetPasswordToken:   { type: String,  default: null },
    resetPasswordExpires: { type: Date,    default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);