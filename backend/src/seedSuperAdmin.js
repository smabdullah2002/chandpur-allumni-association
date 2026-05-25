const bcrypt = require('bcryptjs');
const User = require('./models/User');

const SUPER_ADMIN_EMAIL = 'mananematlab@gmail.com';
const SUPER_ADMIN_PASSWORD = '123matlab';

async function ensureSuperAdmin() {
  try {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    await User.updateOne(
      { email: SUPER_ADMIN_EMAIL },
      {
        $set: {
          fullName: 'Super Admin',
          passwordHash,
          role: 'super-admin',
          status: 'approved',
          district: 'Chandpur',
          division: 'Chittagong'
        },
        $setOnInsert: {
          email: SUPER_ADMIN_EMAIL
        }
      },
      { upsert: true }
    );

    console.log(`Super admin ensured: ${SUPER_ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Failed to ensure super admin:', error.message);
  }
}

module.exports = ensureSuperAdmin;