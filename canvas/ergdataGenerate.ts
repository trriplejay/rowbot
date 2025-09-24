import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { writeFileSync } from 'fs';

// Define types for better type safety
interface WorkoutRow {
  time: string;
  meter: string;
  pace: string;
  strokeRate: string;
  heartRate: string;
}

interface ErgDataColors {
  background: string;
  cardBackground: string;
  cardBackgroundAlt: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  highlight: string;
}

// Create canvas with mobile-inspired proportions
const canvas: Canvas = createCanvas(800, 1000);
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

// ErgData-inspired color palette
const colors: ErgDataColors = {
  background: '#1a2332',
  cardBackground: '#2a3441',
  cardBackgroundAlt: '#344155',
  primary: '#ffffff',
  secondary: '#94a3b8',
  accent: '#fbbf24',
  border: '#374151',
  highlight: '#3b82f6'
};

// Fill background with ErgData-style dark blue
ctx.fillStyle = colors.background;
ctx.fillRect(0, 0, 800, 1000);

// Title section (like ErgData's workout header)
ctx.fillStyle = colors.primary;
ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('57:59 Rudern', 40, 80);

// Subtitle
ctx.fillStyle = colors.secondary;
ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('8000m • Sep 17, 2025', 40, 110);

// Summary card (like ErgData's top summary)
ctx.fillStyle = colors.cardBackground;
ctx.fillRect(40, 140, 720, 80);

// Round the corners (simplified approach)
ctx.strokeStyle = colors.border;
ctx.lineWidth = 1;
ctx.strokeRect(40, 140, 720, 80);

// Summary data
ctx.fillStyle = colors.secondary;
ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('Zeit', 60, 165);
ctx.fillText('Distanz', 200, 165);
ctx.fillText('Tempo', 340, 165);
ctx.fillText('Watt', 480, 165);

ctx.fillStyle = colors.primary;
ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('36:07.1', 60, 190);
ctx.fillText('8000 m', 200, 190);
ctx.fillText('2:15.4', 340, 190);
ctx.fillText('125', 480, 190);

// Split-Tabelle header
ctx.fillStyle = colors.primary;
ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('Split-Tabelle', 40, 270);

// Column headers
ctx.fillStyle = colors.secondary;
ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('Zeit', 80, 310);
ctx.fillText('Distanz', 200, 310);
ctx.fillText('Tempo', 340, 310);
ctx.fillText('Watt', 480, 310);

// Table rows data (ErgData style with numbered rows)
const rowData: WorkoutRow[] = [
  { time: '5:00.0', meter: '1095', pace: '2:16.9', strokeRate: '19', heartRate: '136' },
  { time: '10:00.0', meter: '3840', pace: '2:03.9', strokeRate: '20', heartRate: '587' },
  { time: '15:00.0', meter: '1095', pace: '2:16.9', strokeRate: '19', heartRate: '136' },
  { time: '20:00.0', meter: '3840', pace: '2:03.9', strokeRate: '20', heartRate: '587' },
  { time: '25:00.0', meter: '1095', pace: '2:16.9', strokeRate: '19', heartRate: '136' },
  { time: '30:00.0', meter: '1141', pace: '2:11.4', strokeRate: '20', heartRate: '154' }
];

// Draw ErgData-style cards for each split
let yPos: number = 340;
ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';

rowData.forEach((row: WorkoutRow, index: number) => {
  // Card background with ErgData styling
  if (index === 1 || index === 3) {
    // Highlighted rows (like starred splits in ErgData)
    ctx.fillStyle = colors.cardBackgroundAlt;
    ctx.fillRect(40, yPos, 720, 50);

    // Add star indicator
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText('★', 680, yPos + 32);
  } else {
    ctx.fillStyle = colors.cardBackground;
    ctx.fillRect(40, yPos, 720, 50);
  }

  // Card border
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, yPos, 720, 50);

  // Row number (ErgData style)
  ctx.fillStyle = colors.secondary;
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillText((index + 1).toString(), 60, yPos + 32);

  // Data values
  ctx.fillStyle = colors.primary;
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillText(row.time, 80, yPos + 32);
  ctx.fillText(row.meter + ' m', 200, yPos + 32);
  ctx.fillText(row.pace, 340, yPos + 32);
  ctx.fillText(row.heartRate, 480, yPos + 32);

  yPos += 60;
});

// Total row (like ErgData's summary)
ctx.fillStyle = colors.highlight + '20';
ctx.fillRect(40, yPos + 20, 720, 50);

ctx.strokeStyle = colors.highlight;
ctx.lineWidth = 2;
ctx.strokeRect(40, yPos + 20, 720, 50);

ctx.fillStyle = colors.secondary;
ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('Total', 60, yPos + 45);

ctx.fillStyle = colors.primary;
ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('36:07.1', 80, yPos + 52);
ctx.fillText('8000 m', 200, yPos + 52);
ctx.fillText('2:15.4', 340, yPos + 52);
ctx.fillText('143', 480, yPos + 52);

// Footer text (ErgData style)
ctx.fillStyle = colors.secondary;
ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('- Weniger Splits anzeigen', 40, yPos + 120);

// Add some mobile-style UI elements
ctx.fillStyle = colors.border;
ctx.fillRect(40, 240, 720, 1);

// Status bar simulation at top
ctx.fillStyle = colors.secondary;
ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('11:14', 40, 25);
ctx.fillText('66%', 720, 25);

// Save the image
const buffer: Buffer = canvas.toBuffer('image/png');
writeFileSync('./canvas/images/ergdata-style-pm5.png', buffer);

console.log('ErgData Style PM5 display saved as ergdata-style-pm5.png');
