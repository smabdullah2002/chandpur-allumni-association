# =========================
# Frontend Build Stage
# =========================

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build


# =========================
# Backend Runtime Stage
# =========================

FROM node:20-alpine AS runtime

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]