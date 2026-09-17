#!/usr/bin/env sh
# Start the image search app in Docker.
#
#   ./run.sh              build if needed, then start on http://localhost:8000
#   ./run.sh dev          live reload: API on :8000, UI on :5173
#   ./run.sh build-index  embed the images into images_embedded/ (costs API calls)
#   ./run.sh stop         stop and remove the container
#   ./run.sh logs         follow the server log
#
# Plain POSIX sh, so it runs under bash, zsh, dash, Git Bash and WSL alike.

set -eu

cd "$(dirname "$0")"

# Compose v2 is a docker subcommand; older installs have a separate binary.
if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
elif command -v docker-compose >/dev/null 2>&1; then
  compose() { docker-compose "$@"; }
else
  echo "Error: Docker Compose not found."
  echo "Install Docker Desktop: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is installed but not running. Start Docker Desktop and retry."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Error: .env not found. Create it with your Gemini key:"
  echo "    echo 'GEMINI_API_KEY=your-key-here' > .env"
  exit 1
fi

case "${1:-up}" in
  build-index)
    shift
    [ -d data/subset ] || { echo "Error: data/subset/ not found — download the Flickr8k subset first."; exit 1; }
    compose --profile tools run --rm build-index "$@"
    ;;
  stop)
    # -f both files so dev containers are removed too.
    compose -f docker-compose.yml -f docker-compose.dev.yml down
    ;;
  logs)
    compose logs -f app
    ;;
  dev)
    if [ ! -f images_embedded/embeddings.npy ]; then
      echo "Error: images_embedded/embeddings.npy not found. Build it first:"
      echo "    ./run.sh build-index --limit 500"
      exit 1
    fi
    echo "Dev mode — open http://localhost:5173 (hot reload). API on :8000."
    compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    ;;
  up)
    if [ ! -f images_embedded/embeddings.npy ]; then
      echo "Error: images_embedded/embeddings.npy not found. Build it first:"
      echo "    ./run.sh build-index --limit 500"
      exit 1
    fi
    echo "Starting on http://localhost:8000 (Ctrl+C to stop)…"
    compose up --build
    ;;
  *)
    echo "Usage: ./run.sh [up|dev|build-index|stop|logs]"
    exit 1
    ;;
esac
