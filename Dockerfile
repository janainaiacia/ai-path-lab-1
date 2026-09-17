# ── Stage 1: build the React app ────────────────────────────────────────────
# Node is only needed to compile the frontend. Keeping it in its own stage
# means the shipped image has no Node, no node_modules and no sources — just
# the compiled bundle.
FROM node:22-alpine AS frontend

WORKDIR /app/frontend

# Copy manifests first: this layer is cached and only re-runs when the
# dependencies actually change, not on every source edit.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Vite's default outDir, so this writes to /app/frontend/dist.
RUN npm run build


# ── Stage 2: Python runtime ─────────────────────────────────────────────────
FROM python:3.13-slim

WORKDIR /app

# Same caching trick: dependencies before source.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY image_search/ ./image_search/
COPY scripts/ ./scripts/
COPY main.py ./

# The compiled frontend from stage 1. FastAPI serves this directory.
COPY --from=frontend /app/frontend/dist ./frontend/dist

# data/ (1.1 GB of Flickr8k) and images_embedded/ are deliberately NOT copied — they are
# mounted at runtime. Baking them in would make the image enormous and force a
# rebuild every time the index changes.

EXPOSE 8000

# 0.0.0.0 rather than localhost: inside a container, binding to loopback would
# make the port unreachable from the host.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
