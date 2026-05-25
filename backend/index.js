const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDatabase = require('./src/db');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const adminSliderRoutes = require('./src/routes/adminSliders');
const adminGalleryRoutes = require('./src/routes/adminGallery');
const donationRoutes = require('./src/routes/donations');
const aboutRoutes = require('./src/routes/about');
const noticeRoutes = require('./src/routes/notices');
const eventRoutes = require('./src/routes/events');
const sliderRoutes = require('./src/routes/sliders');
const membersRoutes = require('./src/routes/members');
const galleryRoutes = require('./src/routes/gallery');
const newsletterRoutes = require('./src/routes/newsletter');
const statsRoutes = require('./src/routes/stats');
const ensureSuperAdmin = require('./src/seedSuperAdmin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Monone Motlob API', health: '/api/health' });
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/sliders', adminSliderRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/stats', statsRoutes);

const clientDist = path.join(__dirname, '..', 'frontend', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

async function startServer() {
  await connectDatabase();
  await ensureSuperAdmin();
  const server = app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing process first.`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
}

startServer();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason?.message || reason);
});