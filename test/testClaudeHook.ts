import {
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    WebhookClient,
    Message,
    type ColorResolvable,
    type RGBTuple,
    MessagePayload,
    type APIMessage
} from 'discord.js';

// ===================================
// TYPE DEFINITIONS
// ===================================

interface TableRow {
    col1: string | number;
    col2: string | number;
    col3: string | number;
    col4: string | number;
}

interface TableHeaders {
    col1: string;
    col2: string;
    col3: string;
    col4: string;
}

interface TableMessage {
    components: any[];
    flags: MessageFlags;
}

interface WebhookSendOptions extends TableMessage {
    username?: string;
    avatarURL?: string;
}

type TableType = 'sales' | 'servers' | 'leaderboard' | 'financial' | 'interactive';

interface TableBuilderConfig {
    title?: string;
    accentColor?: RGBTuple;
    maxRows?: number;
    columnWidths?: [number, number, number, number];
    maxTableWidth?: number;
    truncateText?: boolean;
}

// ===================================
// TABLE BUILDER CLASS
// ===================================

class DiscordTableBuilder {
    private title: string | null;
    private headers: string[];
    private summaryRow: (string | number)[] | null;
    private dataRows: (string | number)[][];
    private readonly maxRows: number;
    private accentColor: RGBTuple;
    private columnWidths: [number, number, number, number];
    private readonly maxTableWidth: number;
    private readonly truncateText: boolean;

    constructor(title: string | null = null, config: Partial<TableBuilderConfig> = {}) {
        this.title = title;
        this.headers = [];
        this.summaryRow = null;
        this.dataRows = [];
        this.maxRows = config.maxRows ?? 25; // Discord component limit consideration
        this.accentColor = config.accentColor ?? [0,150,50]; // Default Discord blurple
        this.maxTableWidth = config.maxTableWidth ?? 40; // Max total table width
        this.truncateText = config.truncateText ?? true;

        // Calculate optimal column widths based on max table width
        this.columnWidths = config.columnWidths ?? this.calculateOptimalWidths();
    }

    // Set custom column widths (validates total width)
    public setColumnWidths(widths: [number, number, number, number]): DiscordTableBuilder {
      const totalWidth = widths.reduce((sum, width) => sum + width, 0) + 3; // +3 for spaces
      if (totalWidth > this.maxTableWidth) {
          console.warn(`Column widths total ${totalWidth} exceeds max table width ${this.maxTableWidth}. Adjusting automatically.`);
          this.columnWidths = this.calculateOptimalWidths();
      } else {
          this.columnWidths = widths;
      }
      return this;
    }// Discord Components v2 Table Layout System - TypeScript
    // Creates beautiful table-like displays using TextDisplay components

    // Set table headers (4 columns)
    public setHeaders(col1: string, col2: string, col3: string, col4: string): DiscordTableBuilder {
        this.headers = [col1, col2, col3, col4];
        return this;
    }

    // Set table headers using interface
    public setHeadersFromObject(headers: TableHeaders): DiscordTableBuilder {
        return this.setHeaders(headers.col1, headers.col2, headers.col3, headers.col4);
    }

    // Set summary row data
    public setSummaryRow(col1: string | number, col2: string | number, col3: string | number, col4: string | number): DiscordTableBuilder {
        this.summaryRow = [col1, col2, col3, col4];
        return this;
    }

    // Set summary row using interface
    public setSummaryRowFromObject(row: TableRow): DiscordTableBuilder {
        return this.setSummaryRow(row.col1, row.col2, row.col3, row.col4);
    }

    // Add data rows (up to maxRows)
    public addDataRow(col1: string | number, col2: string | number, col3: string | number, col4: string | number): DiscordTableBuilder {
        if (this.dataRows.length >= this.maxRows) {
            console.warn(`Maximum ${this.maxRows} data rows exceeded. Row not added.`);
            return this;
        }
        this.dataRows.push([col1, col2, col3, col4]);
        return this;
    }

    // Add data row using interface
    public addDataRowFromObject(row: TableRow): DiscordTableBuilder {
        return this.addDataRow(row.col1, row.col2, row.col3, row.col4);
    }

    // Add multiple data rows at once
    public addDataRows(rows: (string | number)[][]): DiscordTableBuilder {
        rows.forEach((row: (string | number)[]) => {
            if (Array.isArray(row) && row.length === 4) {
                this.addDataRow(row[0] as any, row[1] as any, row[2] as any, row[3] as any);
            }
        });
        return this;
    }

    // Add multiple data rows using interface array
    public addDataRowsFromObjects(rows: TableRow[]): DiscordTableBuilder {
        rows.forEach(row => this.addDataRowFromObject(row));
        return this;
    }

    // Set accent color for the container
    public setAccentColor(color: RGBTuple): DiscordTableBuilder {
        this.accentColor = color;
        return this;
    }

    // Calculate optimal column widths for 50 character limit
    private calculateOptimalWidths(): [number, number, number, number] {
        // Reserve 3 characters for spaces between columns
        const availableWidth = this.maxTableWidth - 3;

        // Default distribution: 30%, 20%, 20%, 30% of available width
        const col1Width = Math.floor(availableWidth * 0.30);
        const col2Width = Math.floor(availableWidth * 0.20);
        const col3Width = Math.floor(availableWidth * 0.20);
        const col4Width = availableWidth - col1Width - col2Width - col3Width;

        return [col1Width, col2Width, col3Width, col4Width];
    }

    // Helper method to truncate text if needed
    private truncateTextIfNeeded(text: string, maxLength: number): string {
        if (!this.truncateText || text.length <= maxLength) {
            return text;
        }

        if (maxLength <= 3) {
            return text.substring(0, maxLength);
        }

        return text.substring(0, maxLength - 3) + '...';
    }

    // Helper method to format a table row with proper spacing and width limits
    private formatTableRow(data: (string | number)[], isBold: boolean = false, isCode: boolean = false): string {
        const formatted = data.map((cell, index) => {
            const cellStr = String(cell ?? '');
            const width = this.columnWidths[index] || 0;

            // Truncate text if it exceeds column width
            const truncatedText = this.truncateTextIfNeeded(cellStr, width);

            if (isCode) {
                // Use monospace formatting for alignment
                return `\`${truncatedText.padEnd(width - 2)}\``;
            } else if (isBold) {
                // For bold text, we need to account for markdown characters
                const boldText = `**${truncatedText}**`;
                return boldText.padEnd(width + 4); // Account for markdown
            } else {
                return truncatedText.padEnd(width);
            }
        });

        const result = formatted.join(' ');

        // Ensure the total line doesn't exceed max width
        return result.length > this.maxTableWidth
            ? result.substring(0, this.maxTableWidth)
            : result;
    }

    // Get table statistics
    public getStats(): { headerCount: number; hasSummary: boolean; dataRowCount: number; totalRows: number } {
        return {
            headerCount: this.headers.length,
            hasSummary: this.summaryRow !== null,
            dataRowCount: this.dataRows.length,
            totalRows: this.dataRows.length + (this.summaryRow ? 1 : 0)
        };
    }

    // Validate table configuration
    public validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.headers.length !== 4) {
            errors.push('Headers must have exactly 4 columns');
        }

        if (this.summaryRow && this.summaryRow.length !== 4) {
            errors.push('Summary row must have exactly 4 columns');
        }

        this.dataRows.forEach((row, index) => {
            if (row.length !== 4) {
                errors.push(`Data row ${index + 1} must have exactly 4 columns`);
            }
        });

        if (this.dataRows.length > this.maxRows) {
            errors.push(`Too many data rows: ${this.dataRows.length}/${this.maxRows} maximum`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Build the complete table message
    public build(): TableMessage {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Table validation failed: ${validation.errors.join(', ')}`);
        }

        const components: any[] = [];

        // Add title if provided
        if (this.title) {
            const titleComponent = new TextDisplayBuilder()
                .setContent(`# ${this.title}`);
            components.push(titleComponent);

            // Add small separator after title
            components.push(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(false)
            );
        }

        // Create the main table container
        const tableContainer = new ContainerBuilder()
            .setAccentColor(this.accentColor);

        // Add headers if provided
        if (this.headers.length === 4) {
            const headerRow = this.formatTableRow(this.headers, false, false);
            const separatorLine = '-'.repeat(Math.min(this.maxTableWidth, 50));
            tableContainer.addTextDisplayComponents(
                (textDisplay: TextDisplayBuilder) => textDisplay
                    .setContent(`\`\`\`\n${headerRow}\n${separatorLine}\`\`\``)
            );
        }

        // Add summary row if provided
        if (this.summaryRow && this.summaryRow.length === 4) {
            const summaryContent = `\`\`\`\n${this.formatTableRow(this.summaryRow, false, false)}\`\`\``;
            tableContainer.addTextDisplayComponents(
                (textDisplay: TextDisplayBuilder) => textDisplay
                    .setContent(`**Summary:**\n${summaryContent}`)
            );

            // Add separator if there are data rows
            if (this.dataRows.length > 0) {
                tableContainer.addSeparatorComponents(
                    (separator: SeparatorBuilder) => separator
                        .setSpacing(SeparatorSpacingSize.Small)
                        .setDivider(true)
                );
            }
        }

        // Add data rows in groups (to avoid hitting component limits)
        if (this.dataRows.length > 0) {
            // Group rows for better display (5 rows per group)
            const rowsPerGroup = 5;
            const groups: (string | number)[][][] = [];

            for (let i = 0; i < this.dataRows.length; i += rowsPerGroup) {
                groups.push(this.dataRows.slice(i, i + rowsPerGroup));
            }

            groups.forEach((group: (string | number)[][], groupIndex: number) => {
                let groupContent = '```\n';
                group.forEach((row: (string | number)[]) => {
                    groupContent += this.formatTableRow(row, false, false) + '\n';
                });
                groupContent += '```';

                tableContainer.addTextDisplayComponents(
                    (textDisplay: TextDisplayBuilder) => textDisplay
                        .setContent(groupContent)
                );

                // Add separator between groups (except for the last group)
                if (groupIndex < groups.length - 1) {
                    tableContainer.addSeparatorComponents(
                        (separator: SeparatorBuilder) => separator
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(false)
                    );
                }
            });
        }

        components.push(tableContainer);

        return {
            components: components,
            flags: MessageFlags.IsComponentsV2
        };
    }
}

// ===================================
// EXAMPLE DATA INTERFACES
// ===================================

interface SalesData {
    product: string;
    unitsSold: number;
    revenue: string;
    growth: string;
}

interface ServerStatus {
    server: string;
    status: string;
    cpuUsage: string;
    memory: string;
}

interface LeaderboardEntry {
    rank: string;
    player: string;
    score: string;
    gamesWon: string;
}

interface FinancialEntry {
    category: string;
    budget: string;
    actual: string;
    variance: string;
}

// ===================================
// EXAMPLE USAGE FUNCTIONS
// ===================================

// Example 1: Sales Report Table with 50-character width
function createSalesReportTable(): TableMessage {
    const salesData: SalesData[] = [
        { product: 'iPhone 15', unitsSold: 324, revenue: '$15,480', growth: '+8.2%' },
        { product: 'MacBook Pro', unitsSold: 89, revenue: '$12,450', growth: '+15.6%' },
        { product: 'iPad Air', unitsSold: 156, revenue: '$7,800', growth: '+22.1%' },
        { product: 'AirPods Pro', unitsSold: 278, revenue: '$6,950', growth: '+5.8%' },
        { product: 'Apple Watch', unitsSold: 142, revenue: '$2,840', growth: '+18.3%' },
        { product: 'Mac Studio', unitsSold: 23, revenue: '$1,150', growth: '+45.2%' },
        { product: 'HomePod', unitsSold: 67, revenue: '$670', growth: '-3.4%' },
        { product: 'Apple TV', unitsSold: 45, revenue: '$540', growth: '+2.1%' }
    ];

    const table = new DiscordTableBuilder('📊 Monthly Sales Report', {
        maxTableWidth: 50,
        accentColor: [0, 150, 50] // Green
    })
        .setHeaders('Product', 'Units', 'Revenue', 'Growth')
        .setSummaryRow('Total', '1,247', '$45,230', '+12.5%');

    salesData.forEach(item => {
        table.addDataRow(item.product, item.unitsSold.toString(), item.revenue, item.growth);
    });

    return table.build();
}

// Example 2: Server Status Table with compact layout
function createServerStatusTable(): TableMessage {
    const serverData: ServerStatus[] = [
        { server: 'Web-01', status: '🟢 Online', cpuUsage: '32%', memory: '45%' },
        { server: 'Web-02', status: '🟢 Online', cpuUsage: '28%', memory: '52%' },
        { server: 'DB-01', status: '🟢 Online', cpuUsage: '67%', memory: '78%' },
        { server: 'DB-02', status: '🟢 Online', cpuUsage: '71%', memory: '82%' },
        { server: 'API-01', status: '🟢 Online', cpuUsage: '23%', memory: '34%' },
        { server: 'API-02', status: '🟢 Online', cpuUsage: '19%', memory: '28%' },
        { server: 'Cache-01', status: '🟢 Online', cpuUsage: '41%', memory: '89%' },
        { server: 'Backup-01', status: '🔴 Offline', cpuUsage: '0%', memory: '0%' }
    ];

    const table = new DiscordTableBuilder('🖥️ Server Status', {
        maxTableWidth: 50,
        accentColor: [0, 50, 150] // Blue
    })
        .setHeaders('Server', 'Status', 'CPU', 'RAM')
        .setSummaryRow('Summary', '7/8 Up', '45%', '68%');

    serverData.forEach(server => {
        table.addDataRow(server.server, server.status, server.cpuUsage, server.memory);
    });

    return table.build();
}

// Example 3: Leaderboard Table
function createLeaderboardTable(): TableMessage {
    const leaderboardData: LeaderboardEntry[] = [
        { rank: '#1 🥇', player: 'ProGamer2024', score: '8,450', gamesWon: '42' },
        { rank: '#2 🥈', player: 'SkillMaster', score: '7,890', gamesWon: '38' },
        { rank: '#3 🥉', player: 'NightHawk', score: '7,234', gamesWon: '35' },
        { rank: '#4', player: 'StealthNinja', score: '6,789', gamesWon: '31' },
        { rank: '#5', player: 'QuickShot', score: '6,456', gamesWon: '29' },
        { rank: '#6', player: 'IronWill', score: '5,987', gamesWon: '27' },
        { rank: '#7', player: 'ShadowBlade', score: '5,654', gamesWon: '25' },
        { rank: '#8', player: 'FireStorm', score: '5,321', gamesWon: '23' },
        { rank: '#9', player: 'IceQueen', score: '4,987', gamesWon: '21' },
        { rank: '#10', player: 'ThunderBolt', score: '4,654', gamesWon: '19' }
    ];

    const table = new DiscordTableBuilder('🏆 Weekly Gaming Leaderboard')
        .setAccentColor([100, 50, 50]) // Gold
        .setHeaders('Rank', 'Player', 'Score', 'Games Won')
        .setSummaryRow('Total', '10 Players', '45,230 pts', '234 wins');

    leaderboardData.forEach(entry => {
        table.addDataRow(entry.rank, entry.player, entry.score, entry.gamesWon);
    });

    return table.build();
}

// Example 4: Financial Summary Table
function createFinancialTable(): TableMessage {
    const financialData: FinancialEntry[] = [
        { category: 'Revenue', budget: '$450,000', actual: '$485,200', variance: '+$35,200' },
        { category: 'Marketing', budget: '$75,000', actual: '$68,300', variance: '-$6,700' },
        { category: 'Development', budget: '$125,000', actual: '$132,400', variance: '+$7,400' },
        { category: 'Operations', budget: '$98,000', actual: '$94,600', variance: '-$3,400' },
        { category: 'Support', budget: '$45,000', actual: '$42,800', variance: '-$2,200' },
        { category: 'Infrastructure', budget: '$67,000', actual: '$71,200', variance: '+$4,200' },
        { category: 'Legal', budget: '$23,000', actual: '$18,900', variance: '-$4,100' },
        { category: 'HR', budget: '$34,000', actual: '$31,700', variance: '-$2,300' },
        { category: 'Facilities', budget: '$28,000', actual: '$25,600', variance: '-$2,400' },
        { category: 'Travel', budget: '$15,000', actual: '$12,800', variance: '-$2,200' }
    ];

    const table = new DiscordTableBuilder('💰 Q4 Financial Summary')
        .setAccentColor([150, 50, 50]) // Pink
        .setHeaders('Category', 'Budget', 'Actual', 'Variance')
        .setSummaryRow('Total', '$500,000', '$478,500', '-$21,500');

    financialData.forEach(entry => {
        table.addDataRow(entry.category, entry.budget, entry.actual, entry.variance);
    });

    return table.build();
}

// ===================================
// ENHANCED TABLE WITH ACTIONS
// ===================================

function createInteractiveTable(): TableMessage {
    // Create the table
    const tableMessage = createSalesReportTable();

    // Add action buttons below the table
    const actionRow = new ActionRowBuilder()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('export_csv')
                .setLabel('Export CSV')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📄'),
            new ButtonBuilder()
                .setCustomId('refresh_data')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄'),
            new ButtonBuilder()
                .setCustomId('view_details')
                .setLabel('View Details')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔍')
        ]);

    // Add the action row to components
    tableMessage.components.push(actionRow);

    return tableMessage;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Helper function to create a simple data table
function createSimpleTable(
    title: string,
    headers: [string, string, string, string],
    summaryRow: [string | number, string | number, string | number, string | number] | null = null,
    dataRows: (string | number)[][] = [],
    color: RGBTuple = [0, 150, 50]
): TableMessage {
    const table = new DiscordTableBuilder(title)
        .setAccentColor(color)
        .setHeaders(...headers);

    if (summaryRow) {
        table.setSummaryRow(...summaryRow);
    }

    if (dataRows && dataRows.length > 0) {
        table.addDataRows(dataRows);
    }

    return table.build();
}

// Function to format numbers with commas
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Function to format currency
function formatCurrency(amount: number): string {
    return `$${formatNumber(Math.abs(amount))}${amount < 0 ? ' (-)' : ''}`;
}

// Function to format percentage
function formatPercentage(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent}%`;
}

// ===================================
// WEBHOOK EXAMPLE
// ===================================

async function sendTableViaWebhook(
    webhookClient: WebhookClient,
    tableType: TableType = 'sales'
): Promise<APIMessage> {
    try {
        let tableMessage: TableMessage;

        switch (tableType) {
            case 'sales':
                tableMessage = createSalesReportTable();
                break;
            case 'servers':
                tableMessage = createServerStatusTable();
                break;
            case 'leaderboard':
                tableMessage = createLeaderboardTable();
                break;
            case 'financial':
                tableMessage = createFinancialTable();
                break;
            case 'interactive':
                tableMessage = createInteractiveTable();
                break;
            default:
                tableMessage = createSalesReportTable();
        }

        const webhookOptions: MessagePayload = {
            ...tableMessage,
            withComponents: true,
            username: 'Data Analytics Bot',
            avatarURL: 'https://cdn.discordapp.com/embed/avatars/2.png'
        } as unknown as MessagePayload;

        const response = await webhookClient.send(webhookOptions);

        console.log(`✅ ${tableType} table sent successfully!`);
        return response;
    } catch (error) {
        console.error(`❌ Error sending ${tableType} table:`, error);
        throw error;
    }
}

// ===================================
// ADVANCED TABLE FACTORY
// ===================================

class TableFactory {
    private static defaultConfig: TableBuilderConfig = {
        accentColor: [0, 150, 50],
        maxRows: 25,
        maxTableWidth: 50,
        truncateText: true
    };

    public static createSalesTable(data: SalesData[], config?: Partial<TableBuilderConfig>): DiscordTableBuilder {
        const table = new DiscordTableBuilder('📊 Sales Report', { ...this.defaultConfig, ...config })
            .setHeaders('Product', 'Units Sold', 'Revenue', 'Growth');

        data.forEach(item => {
            table.addDataRow(item.product, item.unitsSold.toString(), item.revenue, item.growth);
        });

        return table;
    }

    public static createServerTable(data: ServerStatus[], config?: Partial<TableBuilderConfig>): DiscordTableBuilder {
        const table = new DiscordTableBuilder('🖥️ Server Status', { ...this.defaultConfig, ...config })
            .setHeaders('Server', 'Status', 'CPU Usage', 'Memory');

        data.forEach(server => {
            table.addDataRow(server.server, server.status, server.cpuUsage, server.memory);
        });

        return table;
    }

    public static createCustomTable<T extends Record<string, any>>(
        title: string,
        headers: TableHeaders,
        data: T[],
        columnMapper: (item: T) => [string | number, string | number, string | number, string | number],
        config?: Partial<TableBuilderConfig>
    ): DiscordTableBuilder {
        const table = new DiscordTableBuilder(title, { ...this.defaultConfig, ...config })
            .setHeadersFromObject(headers);

        data.forEach(item => {
            const [col1, col2, col3, col4] = columnMapper(item);
            table.addDataRow(col1, col2, col3, col4);
        });

        return table;
    }
}

// ===================================
// EXPORT ALL FUNCTIONS AND TYPES
// ===================================

export {
    // Classes
    DiscordTableBuilder,
    TableFactory,

    // Functions
    createSalesReportTable,
    createServerStatusTable,
    createLeaderboardTable,
    createFinancialTable,
    createInteractiveTable,
    createSimpleTable,
    sendTableViaWebhook,
    formatNumber,
    formatCurrency,
    formatPercentage,

    // Types
    type TableRow,
    type TableHeaders,
    type TableMessage,
    type WebhookSendOptions,
    type TableType,
    type TableBuilderConfig,
    type SalesData,
    type ServerStatus,
    type LeaderboardEntry,
    type FinancialEntry
};

// ===================================
// USAGE EXAMPLES
// ===================================

console.log(`
📊 DISCORD TABLE TYPESCRIPT EXAMPLES (50-char width):

// Basic usage with 50-character width limit:
const table = new DiscordTableBuilder('My Table', {
    maxTableWidth: 50,
    truncateText: true
})
    .setHeaders('Col1', 'Col2', 'Col3', 'Col4')
    .setSummaryRow('Total', 100, 200, 300)
    .addDataRow('Row1', 'A', 'B', 'C');

// Custom width distribution (must total ≤47 + 3 spaces):
const customTable = new DiscordTableBuilder('Custom', {
    maxTableWidth: 50
})
    .setColumnWidths([18, 12, 8, 9]) // Total: 47 + 3 = 50
    .setHeaders('Name', 'Value', 'Type', 'Status');

🎯 50-Character Width Features:
✅ Automatic text truncation with '...'
✅ Optimal column width distribution (30/20/20/30%)
✅ Width validation and auto-adjustment
✅ Compact headers for mobile-friendly display
✅ Preserves table alignment and readability
`);
import { GetDiscordClient } from "../discord/client";

import { testLogbookResultManyIntervals, testLogbookResultWithSplits } from "./testData";

const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL || '' });
const table = createSimpleTable("rowign activity complete", ["meters", "time", "pace", "s/m"], [8000, "24:56.7", "2:16.2", 19], [
  [2000, "05:00.1", "02.15.6", "19"],
  [2000, "05:05.3", "02.16.5", "20"],
  [2000, "05:15.3", "02.17.5", "21"]
])

const webhookOptions: MessagePayload = {
            ...table,
            withComponents: true,
            username: 'Data Analytics Bot',
            avatarURL: 'https://cdn.discordapp.com/embed/avatars/2.png'
        } as unknown as MessagePayload;

        const response = await webhook.send(webhookOptions);
// await sendTableViaWebhook(webhook, "financial");
