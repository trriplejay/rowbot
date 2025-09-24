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

interface DaisyForestColors {
  base100: string;     // Main background
  base200: string;     // Secondary background
  base300: string;     // Tertiary background
  baseContent: string; // Light text
  primary: string;     // Primary green
  secondary: string;   // Secondary teal
  accent: string;      // Accent cyan
  neutral: string;     // Neutral gray
}

// Create canvas with optimized proportions
const canvas: Canvas = createCanvas(650, 450);
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

// DaisyUI Forest theme color palette
const colors: DaisyForestColors = {
  base100: '#1F2937',     // Main dark background
  base200: '#111827',     // Darker background
  base300: '#0F172A',     // Darkest background
  baseContent: '#F9FAFB', // Light text
  primary: '#22C55E',     // Primary green
  secondary: '#14B8A6',   // Secondary teal
  accent: '#06B6D4',      // Accent cyan
  neutral: '#374151'      // Neutral gray
};

// Fill background with base color
ctx.fillStyle = colors.base300;
ctx.fillRect(0, 0, 650, 450);

// Add some retro scanlines effect
ctx.strokeStyle = colors.neutral;
ctx.lineWidth = 1;
for (let i = 0; i < 450; i += 4) {
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(0, i);
  ctx.lineTo(650, i);
  ctx.stroke();
}
ctx.globalAlpha = 1;

// Outer border with glow effect
ctx.strokeStyle = colors.primary;
ctx.lineWidth = 4;
ctx.shadowColor = colors.primary;
ctx.shadowBlur = 15;
ctx.strokeRect(20, 20, 610, 410);
ctx.shadowBlur = 0;

// Inner border
ctx.strokeStyle = colors.secondary;
ctx.lineWidth = 2;
ctx.shadowColor = colors.secondary;
ctx.shadowBlur = 10;
ctx.strokeRect(40, 40, 570, 370);
ctx.shadowBlur = 0;

// Terminal header
ctx.fillStyle = colors.accent;
ctx.shadowColor = colors.accent;
ctx.shadowBlur = 8;
ctx.font = 'bold 24px monospace';
ctx.fillText('>>> TRAINING_DATA.EXE <<<', 60, 80);
ctx.shadowBlur = 0;

// Date section
ctx.fillStyle = colors.primary;
ctx.shadowColor = colors.primary;
ctx.shadowBlur = 6;
ctx.font = '20px monospace';
ctx.fillText('DATE: 2025.09.17', 60, 110);
ctx.shadowBlur = 0;

// Add some retro UI elements
ctx.fillStyle = colors.secondary;
ctx.fillRect(60, 120, 200, 2);
ctx.fillRect(60, 125, 150, 2);
ctx.fillRect(60, 130, 100, 2);

// Table headers section
ctx.fillStyle = colors.base200;
ctx.fillRect(60, 150, 530, 40);

// Border for header
ctx.strokeStyle = colors.accent;
ctx.lineWidth = 2;
ctx.shadowColor = colors.accent;
ctx.shadowBlur = 8;
ctx.strokeRect(60, 150, 530, 40);
ctx.shadowBlur = 0;

// Table headers with font
ctx.fillStyle = colors.baseContent;
ctx.shadowColor = colors.baseContent;
ctx.shadowBlur = 5;
ctx.font = 'bold 16px monospace';
ctx.fillText('TIME', 80, 175);
ctx.fillText('METERS', 180, 175);
ctx.fillText('PACE/500M', 280, 175);
ctx.fillText('S/MIN', 420, 175);
ctx.fillText('BPM', 500, 175);
ctx.shadowBlur = 0;

// Table rows data
const rowData: WorkoutRow[] = [
  { time: '36:07.1', meter: '8000', pace: '2:15.4', strokeRate: '19', heartRate: '143' },
  { time: '07:15.7', meter: '1600', pace: '2:16.1', strokeRate: '18', heartRate: '104' },
  { time: '07:13.4', meter: '3200', pace: '2:15.4', strokeRate: '19', heartRate: '149' },
  { time: '07:11.3', meter: '4800', pace: '2:14.7', strokeRate: '19', heartRate: '150' },
  { time: '07:15.4', meter: '6400', pace: '2:16.0', strokeRate: '19', heartRate: '150' },
  { time: '07:11.2', meter: '8000', pace: '2:14.7', strokeRate: '20', heartRate: '163' }
];

// First row highlighting
ctx.fillStyle = colors.base200;
ctx.fillRect(60, 200, 530, 30);
ctx.strokeStyle = colors.secondary;
ctx.lineWidth = 2;
ctx.shadowColor = colors.secondary;
ctx.shadowBlur = 6;
ctx.strokeRect(60, 200, 530, 30);
ctx.shadowBlur = 0;

// Draw all table rows with DaisyUI styling
ctx.font = '14px monospace';
let yPos: number = 220;

rowData.forEach((row: WorkoutRow, index: number) => {
  // Alternate row colors
  if (index === 0) {
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 4;
  } else if (index % 2 === 0) {
    ctx.fillStyle = colors.accent;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 3;
  } else {
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 3;
  }

  ctx.fillText(row.time, 80, yPos);
  ctx.fillText(row.meter, 180, yPos);
  ctx.fillText(row.pace, 280, yPos);
  ctx.fillText(row.strokeRate, 420, yPos);
  ctx.fillText(row.heartRate, 500, yPos);

  ctx.shadowBlur = 0;

  // Draw pixelated separator lines
  if (index < rowData.length - 1) {
    ctx.fillStyle = colors.neutral;
    // Create pixelated line effect
    for (let x = 60; x < 590; x += 8) {
      ctx.fillRect(x, yPos + 12, 4, 1);
    }
  }

  yPos += 28;
});

// Add some UI decorations
ctx.fillStyle = colors.primary;
ctx.fillRect(60, 370, 4, 15);
ctx.fillRect(70, 375, 4, 10);
ctx.fillRect(80, 380, 4, 8);

ctx.fillStyle = colors.secondary;
ctx.fillRect(570, 370, 4, 15);
ctx.fillRect(560, 375, 4, 10);
ctx.fillRect(550, 380, 4, 8);

// Add terminal-style footer
ctx.fillStyle = colors.accent;
ctx.shadowColor = colors.accent;
ctx.shadowBlur = 6;
ctx.font = '12px monospace';
ctx.fillText('SYSTEM_STATUS: ACTIVE | DATA_STREAM: LIVE', 60, 410);
ctx.shadowBlur = 0;


// Save the image
const buffer: Buffer = canvas.toBuffer('image/png');
writeFileSync('./canvas/images/daisyui-forest-pm5-display-2.png', buffer);

console.log('DaisyUI Forest themed PM5 display saved as daisyui-forest-pm5-display.png');

// Export interface for module usage
interface DaisyForestPM5Display {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  colors: DaisyForestColors;
}

// // Optional: Export for further manipulation
// export const daisyForestPM5Display: DaisyForestPM5Display = { canvas, ctx, colors };
// export { Canvas, CanvasRenderingContext2D, WorkoutRow, DaisyForestColors };
