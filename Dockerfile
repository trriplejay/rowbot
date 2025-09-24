# Use the official Bun image
FROM oven/bun:1

# Install system dependencies for node-canvas
RUN apt-get update && apt-get install -y \
  build-essential \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the application code
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Expose the port
EXPOSE 3000

# Run the application
CMD ["bun", "run", "index.ts"]
