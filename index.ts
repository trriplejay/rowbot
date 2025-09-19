import { EmbedBuilder, WebhookClient } from 'discord.js';
import { getMainPage, getSuccessPage, getErrorPage } from './templates';


const config = {
  concept2: {
    apiBaseUrl: process.env.CONCEPT2_API_BASE_URL || 'https://log-dev.concept2.com',
    clientId: process.env.CONCEPT2_CLIENT_ID!,
    clientSecret: process.env.CONCEPT2_CLIENT_SECRET!,
    redirectUri: ""
  },
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
  },
  server: {
    externalUrl: process.env.APP_EXTERNAL_URL,
    port: parseInt(process.env.PORT || '3000'),
  },
};
config.concept2.redirectUri = `${config.server.externalUrl}/callback`

if (!config.concept2.apiBaseUrl) {
  throw new Error(`missing required configuration: CONCEPT2_API_BASE_URL `);
} else if (!config.discord.webhookUrl) {
  throw new Error("missing required configuration: DISCORD_WEBHOOK_URL")
} else if (!config.server.externalUrl) {
  throw new Error("missing required configuration: APP_EXTERNAL_URL")
}

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

async function exchangeCodeForTokens(code: string): Promise<TokenData> {
  const response = await fetch(`${config.concept2.apiBaseUrl}/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.concept2.clientId,
      client_secret: config.concept2.clientSecret,
      redirect_uri: config.concept2.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return await response.json() as TokenData;
}

function formatTime(tenthsOfSeconds: number): string {
    const totalSeconds =
  Math.floor(tenthsOfSeconds / 10);
    const tenths = tenthsOfSeconds % 10;

    const hours = Math.floor(totalSeconds
   / 3600);
    const minutes =
  Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

  if (hours > 0)
    return `${hours.toString().padStart(2,
  '0')}:${minutes.toString().padStart(2,
  '0')}:${seconds.toString().padStart(2,
  '0')}.${tenths}`;
  else
    return `${minutes.toString().padStart(2,
  '0')}:${seconds.toString().padStart(2,
  '0')}.${tenths}`;
}

async function sendDiscordWebhook(distance: number, time: string) {
  if (!config.discord.webhookUrl) {
    console.error('DISCORD_WEBHOOK_URL not configured');
    return;
  }

  try {
    const webhook = new WebhookClient({ url: config.discord.webhookUrl });

    const embed = new EmbedBuilder()
      .setTitle(':person_rowing_boat: New Rowing Result!')
      .addFields(
        { name: 'Distance', value: `${distance}m`, inline: true },
        { name: 'Time', value: time, inline: true }
      )
      .setColor('#007bff')
      .setTimestamp()
      .setFooter({ text: 'Concept2 Logbook' });

    await webhook.send({ embeds: [embed] });
    console.log('Discord webhook sent successfully');
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
  }
}

const server = Bun.serve({
  port: config.server.port,
  async fetch(req) {
    const url = new URL(req.url);
    const cookies = parseCookies(req.headers.get('cookie'));
    const isLoggedIn = !!(cookies.access_token);

    // Main page
    if (url.pathname === '/') {
      return new Response(getMainPage(isLoggedIn, config), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // OAuth callback
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(getErrorPage(error), {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (!code) {
        return new Response(getErrorPage('No authorization code received'), {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      try {
        const tokenData = await exchangeCodeForTokens(code);

        const response = new Response(getSuccessPage(), {
          headers: { 'Content-Type': 'text/html' },
        });

        // Set secure HTTP-only cookies
        const cookieOptions = 'HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/';
        response.headers.set('Set-Cookie', `access_token=${encodeURIComponent(tokenData.access_token)}; ${cookieOptions}`);
        response.headers.append('Set-Cookie', `refresh_token=${encodeURIComponent(tokenData.refresh_token)}; ${cookieOptions}`);

        return response;
      } catch (error) {
        console.error('Token exchange error:', error);
        return new Response(getErrorPage('Failed to exchange authorization code'), {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    }

    // Logout
    if (url.pathname === '/logout' && req.method === 'POST') {
      const response = new Response('OK');
      response.headers.set('Set-Cookie', 'access_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
      response.headers.append('Set-Cookie', 'refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
      return response;
    }

    // Webhook endpoint
    if (url.pathname === '/webhook' && req.method === 'POST') {
      try {
        const data = await req.json() as any;

        // Extract basic data from Concept2 webhook
        const distance = data.result.distance || 0;
        const time = formatTime(data.result.time) || '00:00:00';

        console.log('Received webhook:', data);

        // Send to Discord
        await sendDiscordWebhook(distance, time);

        return new Response('OK');
      } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response('Error processing webhook', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
