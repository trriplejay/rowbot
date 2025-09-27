import {
  AttachmentBuilder,
  EmbedBuilder,
  WebhookClient,
  type APIEmbedField,
} from "discord.js";
import { getMainPage, getSuccessPage, getErrorPage } from "./templates";
import { GetDBClient, type User } from "./db/client";
import {
  formatTime,
  GetLogbookClient,
  type LogbookResult,
} from "./logbook/client";
import { generateWorkoutDisplay } from "./canvas/generate";

const config = {
  concept2: {
    apiBaseUrl:
      process.env.CONCEPT2_API_BASE_URL || "https://log-dev.concept2.com",
    clientId: process.env.CONCEPT2_CLIENT_ID!,
    clientSecret: process.env.CONCEPT2_CLIENT_SECRET!,
    redirectUri: "",
  },
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
  },
  server: {
    externalUrl: process.env.APP_EXTERNAL_URL,
    port: parseInt(process.env.PORT || "3000"),
  },
  db: {
    url: process.env.TURSO_DATABASE_URL || "",
    token: process.env.TURSO_AUTH_TOKEN || "",
  },
};
config.concept2.redirectUri = `${config.server.externalUrl}/callback`;

if (!config.concept2.apiBaseUrl) {
  throw new Error(`missing required configuration: CONCEPT2_API_BASE_URL `);
} else if (!config.discord.webhookUrl) {
  throw new Error("missing required configuration: DISCORD_WEBHOOK_URL");
} else if (!config.server.externalUrl) {
  throw new Error("missing required configuration: APP_EXTERNAL_URL");
} else if (!config.db.url) {
  throw new Error("missing required configuration: TURSO_DATABASE_URL");
} else if (!config.db.token) {
  throw new Error("missing required configuration: TURSO_AUTH_TOKEN");
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

async function processWebhook(data: any) {
  // Extract basic data from Concept2 webhook
  const distance = data.result.distance || 0;
  const time = formatTime(data.result.time) || "00:00:00";
  const resultId = data.result.id;
  const logbookUserId = data.result.user_id;
  const dbClient = GetDBClient(config.db.url, config.db.token);
  const dbUser = await dbClient.getUserByLogbookId(logbookUserId);

  let lbClient = GetLogbookClient(config.concept2.apiBaseUrl, "");
  const tokenData = await lbClient.getTokenFromRefreshCode(
    dbUser.refreshToken,
    config.concept2.clientId,
    config.concept2.clientSecret,
  );
  await dbClient.updateUser(
    dbUser.logbookId,
    tokenData.access_token,
    tokenData.refresh_token,
  );
  lbClient = GetLogbookClient(
    config.concept2.apiBaseUrl,
    tokenData.access_token,
  );

  const hookResult = await lbClient.getResultById(resultId);

  // Send to Discord
  await sendDiscordWebhook(dbUser, hookResult);
  console.log(`---- finished webhook processing at: ${Date.now()}`);
}

async function sendDiscordWebhook(
  dbUser: User,
  data: LogbookResult,
): Promise<void> {
  if (!config.discord.webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not configured");
    return;
  }

  try {
    const webhook = new WebhookClient({ url: config.discord.webhookUrl });
    const imageBuffer = generateWorkoutDisplay(dbUser.logbookUsername, data);
    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "row-results.png",
    });

    await webhook.send({
      avatarURL: dbUser.profileImageUrl,
      content: `:person_rowing_boat: **${dbUser.logbookUsername}** completed a rowing activity! :person_rowing_boat:`,
      files: [attachment],
    });
    console.log("Discord webhook sent successfully");
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
  }
}

const server = Bun.serve({
  port: config.server.port,
  async fetch(req) {
    console.log(`---- request received at: ${Date.now()}`);
    const url = new URL(req.url);
    const cookies = parseCookies(req.headers.get("cookie"));
    const isLoggedIn = !!cookies.access_token;

    // Main page
    if (url.pathname === "/") {
      return new Response(getMainPage(isLoggedIn, config), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // OAuth callback
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(getErrorPage(error), {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (!code) {
        return new Response(getErrorPage("No authorization code received"), {
          headers: { "Content-Type": "text/html" },
        });
      }

      try {
        let lb = GetLogbookClient(config.concept2.apiBaseUrl, "");
        const tokenData = await lb.getTokenFromAuthCode(
          code,
          config.concept2.clientId,
          config.concept2.clientSecret,
          config.concept2.redirectUri,
        );

        // save user and token data to the turso db
        const db = GetDBClient(config.db.url, config.db.token);

        const response = new Response(getSuccessPage(), {
          headers: { "Content-Type": "text/html" },
        });

        lb = GetLogbookClient(
          config.concept2.apiBaseUrl,
          tokenData.access_token,
        );
        const currentUser = await lb.getCurrentUser();

        await db.createUser(
          currentUser.id,
          currentUser.username,
          currentUser.profileImageUrl,
          tokenData.access_token,
          tokenData.refresh_token,
        );

        // Set secure HTTP-only cookies
        const cookieOptions =
          "HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/";
        response.headers.set(
          "Set-Cookie",
          `access_token=${encodeURIComponent(tokenData.access_token)}; ${cookieOptions}`,
        );
        response.headers.append(
          "Set-Cookie",
          `refresh_token=${encodeURIComponent(tokenData.refresh_token)}; ${cookieOptions}`,
        );

        return response;
      } catch (error) {
        console.error("Token exchange error:", error);
        return new Response(
          getErrorPage("Failed to exchange authorization code"),
          {
            headers: { "Content-Type": "text/html" },
          },
        );
      }
    }

    // Logout
    if (url.pathname === "/logout" && req.method === "POST") {
      const response = new Response("OK");
      response.headers.set(
        "Set-Cookie",
        "access_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/",
      );
      response.headers.append(
        "Set-Cookie",
        "refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/",
      );
      return response;
    }

    // Webhook endpoint
    if (url.pathname === "/webhook" && req.method === "POST") {
      try {
        const data = (await req.json()) as any;
        const hookType = data.type as string;
        // hook types can be result-added, result-updated, result-deleted
        if (hookType !== "result-added") {
          return new Response("unsupported type", { status: 200 });
        } else if (!data.result) {
          console.log("got a bad hook");
          console.log(data);
          return new Response("cannot parse result from hook data", {
            status: 200,
          });
        }
        console.log(
          `processing webhook with user_id:${data.result.user_id} result_id:${data.result.id}`,
        );

        try {
          await processWebhook(data);
        } catch (err) {
          console.log("error processing webhook");
          console.log(err);
        }
        console.log(`---- request complete at: ${Date.now()}`);
        return new Response("OK");
      } catch (error) {
        console.error("Webhook processing error:", error);
        return new Response("Error processing webhook", { status: 500 });
      }
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
