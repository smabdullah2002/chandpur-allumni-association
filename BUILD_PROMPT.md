# Prompt: Build a Community Organisation Platform

Use the prompt below (edit the bracketed placeholders) to ask Claude Code to build a project
similar to this one from scratch.

---

## PASTE THIS INTO A NEW CLAUDE CODE SESSION

Build a full-stack community organisation web app with the following spec. Do not ask clarifying questions — make reasonable decisions and build everything end-to-end.

### Organisation Details
- **Name:** [Your Organisation Name]
- **Location:** [City / Region / Country]
- **Purpose:** [e.g. "Membership management and donation collection for a local community welfare organisation"]

---

### Tech Stack
- **Frontend:** React + Vite, React Router v6, Tailwind CSS, react-icons
- **Backend:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **File uploads:** Cloudinary (via `multer-storage-cloudinary`)
- **Auth:** JWT (7-day expiry), stored in localStorage
- **Email:** Nodemailer (SMTP)

---

### Project Structure
```
project-root/
  backend/
    src/
      models/
      routes/
      middleware/
      config/
      utils/
    index.js
    .env.example
  frontend/
    src/
      pages/
      components/
      context/
    index.html
    vite.config.js
  README.md
```

---

### User Roles & Approval Flow
1. **Guest** — can view public pages only
2. **user** — registered member, must be approved by admin before login works
3. **super-admin** — full admin access, seeded on startup

Registration requires: full name, email, password, address fields, mobile number, date of birth, education, NID document upload (PDF/image), certificate document upload, optional profile photo.

After registration the account is `pending`. Admin approves or rejects it. Send an email notification to the user on status change.

---

### Data Models

**User**
```
fullName, email, passwordHash, role (user|super-admin), status (pending|approved|rejected),
district, division, upazila, villageName, policeStation, mobileNumber, lastEducation,
presentAddress, permanentAddress, dateOfBirth, politicalAffiliation,
profileImage (Cloudinary URL), certificateDocument (Cloudinary URL), nidDocument (Cloudinary URL),
phonePublic (boolean), badge { name, color }, timestamps
```

**Donation**
```
user (ref), category (string), amount (number), donationDate, transactionId,
message, receipt (Cloudinary URL, required), status (pending|approved|rejected),
reviewedBy (ref), reviewedAt, timestamps
```

**Notice** — title, body, createdBy (ref), timestamps

**Event** — title, description, date, location, image (Cloudinary URL), timestamps

**Gallery** — imageUrl (Cloudinary URL), caption, timestamps

**Slider** — imageUrl (Cloudinary URL), caption, order (number), timestamps

**About** — single document: title, body (rich text / markdown), timestamps

**FeeCategory** — name, description, timestamps

**Newsletter** — email, timestamps

---

### API Routes

**Auth** (`/api/auth`)
- `POST /register` — multipart, uploads profileImage + nidDocument + certificateDocument to Cloudinary
- `POST /login` — returns JWT + user object; rejects pending/rejected users
- `GET /me` — returns current user (refresh on page load)
- `PUT /profile` — update name + profile photo
- `PUT /privacy` — toggle phonePublic boolean
- `PUT /password` — change password (requires current password)

**Members** (`/api/members`) — auth required
- `GET /` — list approved members (hide phone if phonePublic=false for non-admin)

**Donations** (`/api/donations`) — auth required
- `GET /` — my donations
- `POST /` — submit donation (upload receipt to Cloudinary)

**Notices** (`/api/notices`) — auth required
- `GET /` — list notices

**Events** (`/api/events`) — public
- `GET /` — list events

**Gallery** (`/api/gallery`) — public
- `GET /` — list images

**Sliders** (`/api/sliders`) — public
- `GET /` — list sliders ordered by `order` field

**About** (`/api/about`) — public
- `GET /` — get about content

**Newsletter** (`/api/newsletter`) — public
- `POST /subscribe` — add email to list

**Admin routes** (all require super-admin JWT):
- `GET/PUT /api/admin/users/:id` — approve/reject/badge users
- `GET/PUT/DELETE /api/admin/donations/:id` — approve/reject donations
- `POST/PUT/DELETE /api/admin/notices`
- `POST/PUT/DELETE /api/admin/events`
- `POST/DELETE /api/admin/gallery`
- `POST/PUT/DELETE /api/admin/sliders`
- `PUT /api/admin/about`
- `GET/POST /api/admin/fee-categories`, `DELETE /api/admin/fee-categories/:id`
- `GET /api/admin/stats` — counts: total members, pending members, total donations, pending donations

---

### Frontend Pages & Routes

**Public**
- `/` — Home: hero image slider (auto-play), org intro section, recent notices teaser
- `/about` — About page (content from DB)
- `/gallery` — Photo grid from DB
- `/events` — Events list
- `/contact` — Static contact info + newsletter subscribe form
- `/register` — Registration form with file uploads
- `/login` — Login form

**User (approved only, wrapped in ProtectedRoute)**
- `/dashboard` — Welcome, account status badge, quick stats (my donations total)
- `/donations` — My donation history table with status badges
- `/donations/new` — Submit donation form (category dropdown, amount, date, transaction ID, receipt upload)
- `/notice` — Notices list
- `/profile` — View/edit name + photo, change password, phone privacy toggle

**Admin (super-admin only, wrapped in ProtectedRoute)**
- `/admin` — Dashboard: stat cards (members, pending, donations, pending donations)
- `/admin/users` — Table of all users, approve/reject buttons, assign badge (name + colour)
- `/admin/donations` — Table of all donations, approve/reject, see receipt image
- `/admin/notices` — Create/edit/delete notices
- `/admin/fee-categories` — Add/delete fee categories
- `/admin/sliders` — Upload/delete hero slider images
- `/admin/gallery` — Upload/delete gallery images
- `/admin/about` — Edit about page content (textarea)

---

### Auth Context
```jsx
// src/context/AuthContext.jsx
// Store { token, user } in localStorage under key "<org-slug>-auth"
// On mount, call GET /api/auth/me to refresh user data
// Provide: auth, setAuth, logout
```

Wrap the app in `<AuthProvider>` in main.jsx.

---

### ProtectedRoute Component
```jsx
// Reads auth from context
// If not logged in → redirect to /login
// If requiredRole="super-admin" and user is not super-admin → redirect to /
// If role="user" and user status !== "approved" → show "Account pending approval" message
```

---

### Layout Component
- Navbar with org logo + name
- Nav links: Home, About, Gallery, Events, Contact
- If logged in: show user avatar + dropdown (Dashboard / Profile / Logout)
- If admin: show "Admin" link in dropdown
- Mobile hamburger menu
- Footer with org name, links, copyright

---

### Email Notifications
Send email (Nodemailer) when:
1. Admin approves a user → "Your account has been approved"
2. Admin rejects a user → "Your account has been rejected"
3. Admin approves a donation → "Your donation has been confirmed"
4. Admin rejects a donation → "Your donation submission was not accepted"

---

### Seed Script (`backend/src/seedSuperAdmin.js`)
Upsert a super-admin on every startup:
- email: `admin@[orgdomain].com`
- password: `admin123` (hashed with bcrypt)
- role: `super-admin`, status: `approved`

Call it from `index.js` after DB connects.

---

### .env Variables Needed
```
PORT=5000
MONGO_URI=<MongoDB Atlas URI>
JWT_SECRET=<random string>
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app password>
SMTP_FROM="Org Name <email>"
```

---

### Style Notes
- Use Tailwind CSS utility classes throughout
- Colour scheme: use a consistent primary colour (e.g. green for Bangladesh context, or customise)
- All admin pages should have a consistent sidebar or top-tab navigation
- Status badges: pending=yellow, approved=green, rejected=red
- Responsive — mobile first

---

### Deliverables
1. Complete backend (`backend/`) with all models, routes, middleware, seed script
2. Complete frontend (`frontend/`) with all pages, components, context
3. `README.md` with setup instructions
4. `backend/.env.example`

Start with the backend models and routes, then build the frontend. Make sure everything connects and works end-to-end.
