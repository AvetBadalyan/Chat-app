# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.21.1

# ── Base ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# ── Build stage ─────────────────────────────────────────────────────────────
FROM base AS build

# Install OS deps needed by some native node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# 1. Install backend deps
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm ci --prefix backend

# 2. Install frontend deps (--include=dev so vite/tailwind are available)
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend --include=dev

# 3. Copy all source and build the frontend
COPY . .
RUN npm run build --prefix frontend

# 4. Prune backend to prod-only deps
RUN npm prune --prefix backend --omit=dev

# ── Production image ─────────────────────────────────────────────────────────
FROM base

# Copy backend (prod deps + source)
COPY --from=build /app/backend ./backend

# Copy compiled frontend assets
COPY --from=build /app/frontend/dist ./frontend/dist

ENV NODE_ENV="production"
EXPOSE 5001

CMD ["node", "backend/src/index.js"]
