import {
  AttachmentBuilder,
  EmbedBuilder,
  Message,
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
import { GetDiscordClient } from "./discord/client";

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
    oauthClientId: process.env.DISCORD_BOT_OAUTH_CLIENT_ID!,
    oauthClientSecret: process.env.DISCORD_BOT_OAUTH_CLIENT_SECRET!,
    botToken: process.env.DISCORD_BOT_TOKEN,
    testGuildId: process.env.DISCORD_TEST_GUILD_ID,
    redirectUri: "",
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
config.discord.redirectUri = `${config.server.externalUrl}/discord/callback`;

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
} else if (!config.discord.oauthClientId) {
  throw new Error("missing required configuration: DISCORD_BOT_OAUTH_CLIENT_ID");
} else if (!config.discord.oauthClientSecret) {
  throw new Error("missing required configuration: DISCORD_BOT_OAUTH_CLIENT_SECRET");
} else if (!config.discord.botToken) {
  throw new Error("missing required configuration: DISCORD_BOT_TOKEN");
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
      content: `:person_rowing_boat: **${dbUser.logbookUsername}** completed a rowing activity!`,
      files: [attachment],
    });
    console.log("Discord webhook sent successfully");
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
  }
}

const discordClient = await GetDiscordClient(config.discord.botToken, config.discord.oauthClientId);

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

    // Concept2 Logbook OAuth callback
    else if (url.pathname === "/callback") {
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

    else if (url.pathname === "/discord/callback") {
      console.log("GOT A DISCORD OAUTH")
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

      const tokenResults = await discordClient.getTokenFromAuthCode(code, config.discord.oauthClientId, config.discord.oauthClientSecret, config.discord.redirectUri);
      console.log(tokenResults);

      const response = new Response(getSuccessPage(), {
          headers: { "Content-Type": "text/html" },
        });
      return response;
    }

    // Logout
    else if (url.pathname === "/logout" && req.method === "POST") {
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
    else if (url.pathname === "/webhook" && req.method === "POST") {
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

const discordOauthWithRedirect = `https://discord.com/oauth2/authorize?client_id=1431016675070836799&response_type=code&redirect_uri=https%3A%2F%2F0eef6cbeb9ef.ngrok-free.app%2Fdiscord%2Fcallback&scope=identify`;


if (discordClient.client) {
  discordClient.client.on("messageCreate", async(message: Message) => {
    if (message.author.bot) return;
    // Handle Direct Messages
    else if (message.channel.isDMBased()) {
      console.log(`DM from ${message.author.tag}: ${message.content}`);
      console.log(`the guild is: ${message.guild?.name}`);
      // Reply to the DM

      if(message.content.startsWith("register")) {
        const mutualGuilds = discordClient.client.guilds.cache.filter(guild =>
        guild.members.cache.has(message.author.id));
        const mutualCount = Object.keys(mutualGuilds).length;
        if ( mutualCount == 0) {
          await message.reply(`Hello! thank you for your interest in RowBot. Unfortunately I have not been added to any servers that you are a member of. Please add me to one of your servers to get started.`);
        } else if (mutualCount > 1) {
          // check if they already sent the specific guild in the msg
          const splitMessage = message.content.split(" ");
          if (splitMessage.length > 1) {
            const guildName = splitMessage[1];
          }
          await message.reply(`Hello! thank you for using RowBot. Please use the following link to connect your discord account with your concept2 logbook account.\n ${discordOauthWithRedirect}`)
        }

      }

      await message.reply("message received");
    }
    else if (message.guild) {
      console.log(`got a guild message: ${message.content}`)
    }
    else {
      console.log("unsupported message received")
    }
  });
  discordClient.client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'register') {
      console.log("got a user registration!")
      console.log(interaction.guild?.name);
      console.log(interaction.user.displayName);
    }
  })
}
