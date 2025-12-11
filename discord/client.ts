import { Events, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

type DiscordUser = {
  id: number;
  username: string;
};

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register with the bot')
    .toJSON(),
];

// Register slash commands with Discord
async function registerCommands(token: string, clientId: string) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('🔄 Registering slash commands...');

    // Register commands globally (takes up to 1 hour to propagate)
    // TODO: add a dev vs prod mode, so that in dev mode it only adds to a test guild while prod adds globally

    if (process.env.DISCORD_TEST_GUILD_ID) {
      console.log("registering guild commands")
      await rest.put(
        Routes.applicationGuildCommands(clientId, process.env.DISCORD_TEST_GUILD_ID),
        { body: commands }
      );
    } else {
      console.log("registering global commands")
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
    }
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

export async function GetDiscordClient(token: string, clientId: string) {
  const baseUrl = "https://discord.com/api";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "",
  };
  let client = undefined;

  headers.Authorization = `Bearer ${token}`;

  client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel]
  });

  client.once(Events.ClientReady, c => {
      console.log(`Ready! Logged in as ${c.user.tag}`);
  });

  await client.login(token);

  await registerCommands(token, clientId);

  return {
    client: client,
    getTokenFromAuthCode: async function (
      code: string,
      clientId: string,
      clientSecret: string,
      redirectUri: string,
    ): Promise<TokenData> {


      const response = await fetch(`${baseUrl}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          scope: "identify",
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord token exchange failed: ${response.statusText}`);
      }
      return (await response.json()) as TokenData;
    },
    getCurrentUser: async function (): Promise<DiscordUser> {
      if (!token) throw new Error("Client must be configured with a token to fetch the current user");

      const rest = new REST({version: "10"}).setToken(token)

      const user = await rest.get(Routes.user())
      console.log(user)
      return user as DiscordUser;
    }

  };
}
