import { MessageFlags, AttachmentBuilder, EmbedBuilder, WebhookClient, type APIEmbedField, SectionBuilder, TextDisplayBuilder, ComponentBuilder, SeparatorBuilder, SeparatorSpacingSize, ContainerBuilder, MessagePayload } from 'discord.js';
import { calculatePace, formatTime, type LogbookResult } from '../logbook/client';
import { formatDiagnostic } from 'typescript';
import type { TableMessage } from '../test/testClaudeHook';


function headerStringBuilder(username: string): string {
  return `### :person_rowing_boat: **${username}** just completed a row! :person_rowing_boat:`
}
function tableColumnHeadersBuilder(): string {
  return `\`time\t\t\tmeter\t\t/500m\t\ts/m\``
}
function topRowResultStringBuilder(results: LogbookResult) {
  const avgPace = calculatePace(results.distance, results.time);
  return `
  \`${formatTime(results.time)}\t\t${results.distance}\t\t${formatTime(avgPace)}\t\t${results.strokeRate}\`
`
}
function splitStringBuilder(results: LogbookResult): string {
  let finalString = ""

  // Add splits or intervals if available
    if (results.workout.splits && results.workout.splits.length > 0) {
      for (const split of results.workout.splits) {
        finalString = finalString.concat(`\`${formatTime(split.time)}\t\t${split.distance}\t\t${formatTime(calculatePace(split.distance, split.time))}\t\t${split.strokeRate}\`\n`);
      }
    } else if (results.workout.intervals && results.workout.intervals.length > 0) {
      for (const split of results.workout.intervals) {
        finalString = finalString.concat(`\`${formatTime(split.time)}\t\t${split.distance}\t\t${formatTime(calculatePace(split.distance, split.time))}\t\t${split.strokeRate}\`\n`);
      }
    }

  return finalString
}

export function GetDiscordClient(webhookUrl: string) {
  if (!webhookUrl) {
    throw new Error("no webhook URL provided to the client")
  }
  return {
    sendHook: async function(msg: TableMessage): Promise<void> {
      const webhook = new WebhookClient({ url: webhookUrl });
      let basicMsg = {
          withComponents: true,
          flags: MessageFlags.IsComponentsV2,
          username: "RowBot",
        }
      basicMsg = {...basicMsg, ...msg};
      await webhook.send(basicMsg as unknown as MessagePayload);
    },
    sendWebhook: async function (username: string, results: LogbookResult): Promise<void> {
      try {
        const webhook = new WebhookClient({ url: webhookUrl });

        const header = new TextDisplayBuilder()
          .setContent(headerStringBuilder(username));

        const separator1 = new SeparatorBuilder()
          .setDivider(true) // Show visual line
          .setSpacing(SeparatorSpacingSize.Large);
        const separator2 = new SeparatorBuilder()
          .setDivider(true) // Show visual line
          .setSpacing(SeparatorSpacingSize.Small);
        const separator3 = new SeparatorBuilder()
          .setDivider(true) // Show visual line
          .setSpacing(SeparatorSpacingSize.Small);
        const columnHeaderData = new TextDisplayBuilder()
          .setContent(tableColumnHeadersBuilder());
        const summaryData = new TextDisplayBuilder()
          .setContent(topRowResultStringBuilder(results));

        const dataSplits = new TextDisplayBuilder()
          .setContent(splitStringBuilder(results));

        const tableContainer = new ContainerBuilder()
          .addTextDisplayComponents(columnHeaderData)
          .addSeparatorComponents(separator2)
          .addTextDisplayComponents(summaryData)
          .addSeparatorComponents(separator2)
          .addTextDisplayComponents(dataSplits)
          .setAccentColor([0,150,50])

        await webhook.send({
          withComponents: true,
          flags: MessageFlags.IsComponentsV2,
          username: "RowBot",
          components: [
            header, tableContainer]
        });

        console.log('Discord webhook sent successfully');
      } catch (error) {
        console.error('Error sending Discord webhook:', error);
      }
    }
  };
}
