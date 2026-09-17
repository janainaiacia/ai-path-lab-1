@echo off
REM Start the image search app in Docker (Windows).
REM
REM   run.cmd              build if needed, then start on http://localhost:8000
REM   run.cmd dev          live reload: API on :8000, UI on :5173
REM   run.cmd build-index  embed the images into images_embedded\ (costs API calls)
REM   run.cmd stop         stop and remove the container
REM   run.cmd logs         follow the server log

setlocal
cd /d "%~dp0"

docker compose version >nul 2>&1
if errorlevel 1 (
  echo Error: Docker Compose not found.
  echo Install Docker Desktop: https://docs.docker.com/get-docker/
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo Error: Docker is installed but not running. Start Docker Desktop and retry.
  exit /b 1
)

if not exist ".env" (
  echo Error: .env not found. Create it with your Gemini key:
  echo     echo GEMINI_API_KEY=your-key-here^> .env
  exit /b 1
)

if "%1"=="build-index" (
  if not exist "data\subset" (
    echo Error: data\subset\ not found - download the Flickr8k subset first.
    exit /b 1
  )
  shift
  docker compose --profile tools run --rm build-index %*
  exit /b %errorlevel%
)

if "%1"=="dev" (
  if not exist "images_embedded\embeddings.npy" (
    echo Error: images_embedded\embeddings.npy not found. Build it first:
    echo     run.cmd build-index --limit 500
    exit /b 1
  )
  echo Dev mode - open http://localhost:5173 (hot reload). API on :8000.
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
  exit /b %errorlevel%
)

if "%1"=="stop" (
  docker compose -f docker-compose.yml -f docker-compose.dev.yml down
  exit /b %errorlevel%
)

if "%1"=="logs" (
  docker compose logs -f app
  exit /b %errorlevel%
)

if not exist "images_embedded\embeddings.npy" (
  echo Error: images_embedded\embeddings.npy not found. Build it first:
  echo     run.cmd build-index --limit 500
  exit /b 1
)

echo Starting on http://localhost:8000 (Ctrl+C to stop)...
docker compose up --build
