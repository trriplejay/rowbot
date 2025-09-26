import { GetDiscordClient } from "../discord/client";

import { testLogbookResultManyIntervals, testLogbookResultWithSplits } from "./testData";

const dclient = GetDiscordClient(process.env.DISCORD_WEBHOOK_URL || "")

await dclient.sendWebhook("foo", testLogbookResultManyIntervals);
