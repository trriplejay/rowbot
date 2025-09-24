# RowBot

A web application that listens for webhooks from the Concept2 logbook API and converts rowing results into a discord message with generated image attachment.

This app uses Turso (sqlite) for stateful data.

I also chose to use [Bun](https://bun.com) for this project just to try it out!

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd rowbot
   bun install
   ```

   note: this app relies on several external dependencies including:

   - Turso
   - Concept2 logbook
   - Discord webhook

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
   - `TURSO_DATABASE_URL`: url to your turso database
   - `TURSO_AUTH_TOKEN`: authentication token for your turso db

3. **Get Concept2 OAuth credentials:**

   - Visit [Concept2 Developer Documentation](https://log.concept2.com/developers/documentation)
   - Register your application to get client ID and secret
   - Set the redirect URI to match your `APP_EXTERNAL_URL`/callback. If you want to run this locally, you can use [ngrok](https://ngrok.com/) to set up a publicly accessible URL that can reach your localhost.

4. **Run the application:**

   ```bash
   bun run index.ts
   ```

**How to Create a Discord webhook:**

- Go to your Discord server settings
- Navigate to Integrations > Webhooks
- Create a new webhook and copy the URL

## Usage

1. Open your browser to `http://localhost:3000`
2. Click "Login with Concept2" to authenticate
3. Configure your Concept2 logbook to send webhooks to a publiclly accessible url `http://12345.ngrok-free.app/webhook`
4. When you complete a rowing session, the app will receive a webhook from concept2 logbook, convert it to a discord message, and send it to the configured channel.

## API Endpoints

- `GET /` - Main page with login/logout interface
- `GET /callback` - OAuth callback handler
- `POST /logout` - Logout and clear cookies
- `POST /webhook` - Concept2 webhook endpoint
