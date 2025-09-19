#!/bin/bash -e

# Build the Docker image
docker build -t row-bot .

# load the env file
. "$(pwd)/.env"
# Run the Docker container with environment variables
docker run -d \
  --name row-bot-container \
  -p 3000:3000 \
  -e CONCEPT2_API_BASE_URL="${CONCEPT2_API_BASE_URL}" \
  -e CONCEPT2_CLIENT_ID="${CONCEPT2_CLIENT_ID}" \
  -e CONCEPT2_CLIENT_SECRET="${CONCEPT2_CLIENT_SECRET}" \
  -e CONCEPT2_REDIRECT_URI="${APP_EXTERNAL_URL}/callback" \
  -e DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL}" \
  -e APP_EXTERNAL_URL="${APP_EXTERNAL_URL}" \
  -e PORT="${PORT}" \
  row-bot
