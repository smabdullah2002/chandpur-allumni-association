# Monone Matlab — Project Guide

## What This Is
A community donation and membership management platform for **Monone Matlab**, a community organisation serving Matlab North and Matlab South upazilas in Chandpur, Bangladesh.

## Stack
- **Frontend:** React + Vite (port 5173), React Router, Tailwind CSS, react-icons
- **Backend:** Node.js + Express (port 5000)
- **Database:** MongoDB Atlas (Mongoose)
- **File storage:** Cloudinary (profiles, documents, gallery, sliders)
- **Email:** Nodemailer (status notifications, newsletters)

## Running Locally
```
# Backend
cd backend && node index.js

# Frontend
cd frontend && npm run dev
```

## Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<secret>
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS   # for Nodemailer
```

## Seeded Admin
On every backend startup, a super-admin is upserted:
- Email: `mananematlab@gmail.com`
- Password: `123matlab`

## Auth Flow
- JWT stored in `localStorage` under key `monone-auth`
- Two roles: `user` and `super-admin`
- Users register (pending) → admin approves/rejects → email notification sent
- `ProtectedRoute` checks role; redirects unapproved users

## Key Models
| Model | Purpose |
|---|---|
| User | Members with profile, NID/certificate docs, badge, approval status |
| Donation | User donation records with receipt image and approval status |
| FeeCategory | Admin-defined categories for donations |
| Notice | Admin-posted notices visible to logged-in members |
| Event | Community events |
| Gallery | Photo gallery (Cloudinary images) |
| Slider | Hero slider images on Home page |
| About | Editable about-page content |
| Newsletter | Email subscribers |

## Route Structure

### Public
- `/` Home — hero slider, org intro
- `/about` About page (content editable by admin)
- `/gallery` Photo gallery
- `/events` Events list
- `/contact` Contact info
- `/register` Membership registration (uploads: profileImage, nidDocument, certificateDocument)
- `/login`

### User (approved members only)
- `/dashboard` Account overview and status
- `/donations` My donations list
- `/donations/new` Submit a new donation
- `/notice` Admin notices
- `/profile` Edit name/photo, change password, phone privacy toggle

### Admin (`super-admin` only)
- `/admin` Dashboard with stats
- `/admin/users` Approve/reject/badge members
- `/admin/donations` Approve/reject donation submissions
- `/admin/notices` Post/edit/delete notices
- `/admin/fee-categories` Manage donation categories
- `/admin/sliders` Manage hero slider images
- `/admin/gallery` Manage gallery images
- `/admin/about` Edit about-page content

## API Base URL
Frontend reads from `import.meta.env.VITE_API_BASE_URL`, defaults to `http://localhost:5000`.

## Cloudinary Folders
- `monone-motlob/profiles` — profile photos (400×400 crop)
- `monone-motlob/documents` — NID + certificate PDFs/images
- `monone-motlob/gallery` — gallery photos
- `monone-motlob/sliders` — hero slider images
- `monone-motlob/receipts` — donation receipt images

## Conventions
- All API routes under `/api/*`
- Auth middleware: `src/middleware/auth.js` (JWT verify)
- Admin middleware: `src/middleware/adminAuth.js` (role check)
- `sanitizeUser()` strips passwordHash before sending user data
- Bangla/Bengali context — org name in Bangla is "মনোনে মটলব"
