#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Pulling latest changes..."
git pull

echo "Building Docker image..."
docker build -t wordle-solver .

echo "Stopping existing container..."
docker stop wordle-solver 2>/dev/null || true
docker rm wordle-solver 2>/dev/null || true

echo "Starting container..."
docker run -d \
    --name wordle-solver \
    --restart unless-stopped \
    -p 127.0.0.1:8001:8000 \
    wordle-solver

echo "Waiting for application..."
sleep 2

echo "Checking application..."
curl --fail --silent http://127.0.0.1:8001/ > /dev/null

echo "Deployment successful: wordle-solver is running."
