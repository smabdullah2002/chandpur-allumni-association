const mongoose = require('mongoose');

const execMemberSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  position: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  department: { type: String, trim: true, default: '' },
}, { _id: false });

const executiveSchema = new mongoose.Schema({
  year: { type: String, trim: true, required: true, unique: true },
  title: { type: String, trim: true, default: '' },
  members: { type: [execMemberSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Executive', executiveSchema);
