# Chandpur Allumni Association- Jahangirnagar University

A React + Node.js + MongoDB website for Chandpur Allumni Association- Jahangirnagar University.

## Run locally

1. Install dependencies in each folder.
2. Create `backend/.env` from `backend/.env.example`.
3. Set your MongoDB connection string in `backend/.env`.
4. Run the backend.
5. Run the frontend.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run with Docker

Build the production image from the repository root:

```bash
docker build -t monone-motlob .
```

Run it with your backend environment file:

```bash
docker run --rm -p 5000:5000 --env-file backend/.env monone-motlob
```

If you prefer Compose, the repo includes `docker-compose.yml`:

```bash
docker compose up --build
```

The frontend is built into the same image and served by the Express app from `/frontend/dist` in production mode.

## Notes

- The login form uses email and password.
- Registration accepts extended profile fields.
