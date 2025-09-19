# RowBot

A web application that listens for webhooks from the Concept2 logbook API and converts rowing results into nicely formatted Discord embed messages.

## Features

- Simple web interface with Concept2 OAuth login
- Secure token storage using HTTP-only cookies
- Webhook endpoint for Concept2 logbook integration
- Discord webhook integration with formatted embed messages
- Built with Bun and pure JavaScript/HTML

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd rowbot
   bun install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual values:

   - `CONCEPT2_CLIENT_ID`: Your Concept2 OAuth client ID
   - `CONCEPT2_CLIENT_SECRET`: Your Concept2 OAuth client secret
   - `CONCEPT2_REDIRECT_URI`: OAuth callback URL (default: http://localhost:3000/callback)
   - `DISCORD_WEBHOOK_URL`: Your Discord webhook URL
   - `PORT`: Server port (default: 3000)

3. **Get Concept2 OAuth credentials:**

   - Visit [Concept2 Developer Documentation](https://log.concept2.com/developers/documentation)
   - Register your application to get client ID and secret
   - Set the redirect URI to match your `APP_EXTERNAL_URL`/callback

4. **Create Discord webhook:**

   - Go to your Discord server settings
   - Navigate to Integrations > Webhooks
   - Create a new webhook and copy the URL

5. **Run the application:**
   ```bash
   bun run index.ts
   ```

## Usage

1. Open your browser to `http://localhost:3000`
2. Click "Login with Concept2" to authenticate
3. Configure your Concept2 logbook to send webhooks to `http://your-domain:3000/webhook`
4. When you complete a rowing session, the app will automatically send a Discord message with your results

## API Endpoints

- `GET /` - Main page with login/logout interface
- `GET /callback` - OAuth callback handler
- `POST /logout` - Logout and clear cookies
- `POST /webhook` - Concept2 webhook endpoint

## Security

- Uses HTTP-only secure cookies for token storage
- Implements proper OAuth 2.0 flow
- This app does not have a database. No user data is stored.

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
