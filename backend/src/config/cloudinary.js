const cloudinary = require("cloudinary").v2;

// CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

module.exports = cloudinary;