const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const mailer = require('../config/mailer');

const router = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryClient = require('../config/cloudinary');

// Cloudinary storage for registration documents (NID, certificate, profile photo)
const registrationStorage = new CloudinaryStorage({
  cloudinary: cloudinaryClient,
  params: (_req, file) => {
    const isProfile = file.fieldname === 'profileImage';
    const isDoc = file.fieldname === 'nidDocument' || file.fieldname === 'certificateDocument';
    return {
      folder: isProfile ? 'chandpur-alumni/profiles' : 'chandpur-alumni/documents',
      allowed_formats: isProfile ? ['jpg', 'jpeg', 'png'] : ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: isDoc ? 'auto' : 'image',
      transformation: isProfile
        ? [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }]
        : undefined,
    };
  },
});

const upload = multer({
  storage: registrationStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Cloudinary storage for profile photo updates
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinaryClient,
  params: {
    folder: 'chandpur-alumni/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});
const cloudUpload = multer({ storage: profileStorage, limits: { fileSize: 2 * 1024 * 1024 } });



function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role },
    process.env.JWT_SECRET || 'monone-secret',
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    district: user.district,
    division: user.division,
    upazila: user.upazila,
    villageName: user.villageName,
    policeStation: user.policeStation,
    mobileNumber: user.mobileNumber,
    lastEducation: user.lastEducation,
    profession: user.profession,
    presentAddress: user.presentAddress,
    permanentAddress: user.permanentAddress,
    dateOfBirth: user.dateOfBirth,
    politicalAffiliation: user.politicalAffiliation,
    profileImage: user.profileImage,
    certificateDocument: user.certificateDocument,
    nidDocument: user.nidDocument,
    phonePublic: user.phonePublic ?? false,
    createdAt: user.createdAt
  };
}

router.post(
  '/register',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'certificateDocument', maxCount: 1 },
    { name: 'nidDocument', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        district,
        division,
        upazila,
        villageName,
        policeStation,
        mobileNumber,
        lastEducation,
        profession,
        presentAddress,
        permanentAddress,
        dateOfBirth,
        politicalAffiliation
      } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const certificateDocument = req.files?.certificateDocument?.[0];
      const nidDocument = req.files?.nidDocument?.[0];
      if (!certificateDocument || !nidDocument) {
        return res.status(400).json({ message: 'Certificate and NID documents are required' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullName,
        email,
        passwordHash,
        district: district || 'Chandpur',
        division: division || 'Chittagong',
        upazila,
        villageName,
        policeStation,
        mobileNumber,
        lastEducation,
        profession,
        presentAddress,
        permanentAddress,
        dateOfBirth,
        politicalAffiliation,
        // Cloudinary returns the URL via req.file.path
        profileImage: req.files?.profileImage?.[0]?.path || null,
        certificateDocument: certificateDocument.path,
        nidDocument: nidDocument.path,
      });

      return res.status(201).json({
        message: 'Registration submitted for approval',
        user: sanitizeUser(user)
      });
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Failed to register' });
    }
  }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'user' && user.status !== 'approved') {
      return res.status(403).json({ message: `Account ${user.status}` });
    }

    const token = createToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to login' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'user' && user.status !== 'approved') {
    return res.status(403).json({ message: `Account ${user.status}` });
  }

  return res.json({ user: sanitizeUser(user) });
});


// UPDATE profile (name + photo)
router.put('/profile', authMiddleware, cloudUpload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {};
    if (req.body.fullName) updateData.fullName = req.body.fullName;

    if (req.file) {
      // Delete old photo from Cloudinary if it exists and is a Cloudinary URL
      if (user.profileImage && user.profileImage.startsWith('http')) {
        const parts = user.profileImage.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const publicId = `monone-matlab/profiles/${filename}`;
        const cloudinary = require('../config/cloudinary');
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      updateData.profileImage = req.file.path; // Cloudinary URL
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    return res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
});

// TOGGLE phone privacy
router.put('/privacy', authMiddleware, async (req, res) => {
  try {
    const { phonePublic } = req.body;
    if (typeof phonePublic !== 'boolean') {
      return res.status(400).json({ message: 'phonePublic must be a boolean' });
    }
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { phonePublic },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update privacy' });
  }
});

// CHANGE password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    await User.findByIdAndUpdate(user._id, {
      passwordHash: await bcrypt.hash(newPassword, 10),
    });
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update password' });
  }
});

// FORGOT PASSWORD — send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return 200 to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken:   token,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    mailer.sendMail({
      from: `"Chandpur Allumni Association- Jahangirnagar University" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request — Chandpur Allumni Association- Jahangirnagar University',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f0f2ff;padding:32px 20px;">
          <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(90,78,246,0.12);">
            <div style="background:linear-gradient(135deg,#5a4ef6,#7c5fff);padding:32px 36px 24px;">
              <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Reset Your Password</h1>
              <p style="color:rgba(255,255,255,.75);font-size:14px;margin:0;">Chandpur Allumni Association- Jahangirnagar University account recovery</p>
            </div>
            <div style="padding:32px 36px;">
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">
                Hi <strong>${user.fullName}</strong>,<br/>
                We received a request to reset your password. Click the button below to choose a new one.
                This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetLink}"
                style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#5a4ef6,#7c5fff);
                  color:#fff;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;">
                Reset Password
              </a>
              <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;line-height:1.6;">
                If you did not request this, you can safely ignore this email.<br/>
                This link will expire in 1 hour.
              </p>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => console.error('[forgot-password] Email send failed:', err.message));

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[forgot-password]', error.message);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// RESET PASSWORD — set new password via token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    await User.findByIdAndUpdate(user._id, {
      passwordHash:         await bcrypt.hash(password, 10),
      resetPasswordToken:   null,
      resetPasswordExpires: null,
    });

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to reset password' });
  }
});

module.exports = router;
