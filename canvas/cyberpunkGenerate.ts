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

interface CyberpunkColors {
  neonCyan: string;
  neonMagenta: string;
  neonYellow: string;
  darkPurple: string;
  black: string;
  darkCyan: string;
  brightGreen: string;
  orange: string;
}

// Create canvas with retro proportions
const canvas: Canvas = createCanvas(800, 600);
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

// Cyberpunk 2077 inspired color palette
const colors: CyberpunkColors = {
  neonCyan: '#00ffff',
  neonMagenta: '#ff00ff',
  neonYellow: '#ffff00',
  darkPurple: '#1a0d26',
  black: '#000000',
  darkCyan: '#0d4d4d',
  brightGreen: '#00ff41',
  orange: '#ff6600'
};

// Fill background with dark cyberpunk color
ctx.fillStyle = colors.darkPurple;
ctx.fillRect(0, 0, 800, 600);

// Add some retro scanlines effect
ctx.strokeStyle = colors.darkCyan;
ctx.lineWidth = 1;
for (let i = 0; i < 600; i += 4) {
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(0, i);
  ctx.lineTo(800, i);
  ctx.stroke();
}
ctx.globalAlpha = 1;

// Outer border with neon glow effect
ctx.strokeStyle = colors.neonCyan;
ctx.lineWidth = 4;
ctx.shadowColor = colors.neonCyan;
ctx.shadowBlur = 15;
ctx.strokeRect(20, 20, 760, 560);
ctx.shadowBlur = 0;

// Inner border
ctx.strokeStyle = colors.neonMagenta;
ctx.lineWidth = 2;
ctx.shadowColor = colors.neonMagenta;
ctx.shadowBlur = 10;
ctx.strokeRect(40, 40, 720, 520);
ctx.shadowBlur = 0;

// Retro terminal header
ctx.fillStyle = colors.neonYellow;
ctx.shadowColor = colors.neonYellow;
ctx.shadowBlur = 8;
ctx.font = 'bold 24px monospace';
ctx.fillText('>>> TRAINING_DATA.EXE <<<', 60, 80);
ctx.shadowBlur = 0;

// Distance and date section with 8-bit style
ctx.fillStyle = colors.neonCyan;
ctx.shadowColor = colors.neonCyan;
ctx.shadowBlur = 6;
ctx.font = 'bold 32px monospace';
ctx.fillText('8000M_DISTANCE', 60, 130);
ctx.font = '20px monospace';
ctx.fillText('DATE: 2025.09.17', 60, 160);
ctx.shadowBlur = 0;

// Add some retro UI elements
ctx.fillStyle = colors.neonMagenta;
ctx.fillRect(60, 170, 200, 2);
ctx.fillRect(60, 175, 150, 2);
ctx.fillRect(60, 180, 100, 2);

// Table headers section with cyberpunk styling
ctx.fillStyle = colors.darkCyan;
ctx.fillRect(60, 200, 680, 40);

// Neon border for header
ctx.strokeStyle = colors.brightGreen;
ctx.lineWidth = 2;
ctx.shadowColor = colors.brightGreen;
ctx.shadowBlur = 8;
ctx.strokeRect(60, 200, 680, 40);
ctx.shadowBlur = 0;

// Table headers with retro font
ctx.fillStyle = colors.neonYellow;
ctx.shadowColor = colors.neonYellow;
ctx.shadowBlur = 5;
ctx.font = 'bold 18px monospace';
ctx.fillText('TIME_SPLIT', 80, 225);
ctx.fillText('METERS', 220, 225);
ctx.fillText('PACE/500M', 340, 225);
ctx.fillText('S/MIN', 500, 225);
ctx.fillText('BPM', 600, 225);
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

// First row highlighting with neon effect
ctx.fillStyle = colors.darkCyan;
ctx.fillRect(60, 250, 680, 35);
ctx.strokeStyle = colors.neonMagenta;
ctx.lineWidth = 2;
ctx.shadowColor = colors.neonMagenta;
ctx.shadowBlur = 6;
ctx.strokeRect(60, 250, 680, 35);
ctx.shadowBlur = 0;

// Draw all table rows with cyberpunk styling
ctx.font = '16px monospace';
let yPos: number = 270;

rowData.forEach((row: WorkoutRow, index: number) => {
  // Alternate row colors for retro feel
  if (index === 0) {
    ctx.fillStyle = colors.neonCyan;
    ctx.shadowColor = colors.neonCyan;
    ctx.shadowBlur = 4;
  } else if (index % 2 === 0) {
    ctx.fillStyle = colors.brightGreen;
    ctx.shadowColor = colors.brightGreen;
    ctx.shadowBlur = 3;
  } else {
    ctx.fillStyle = colors.neonYellow;
    ctx.shadowColor = colors.neonYellow;
    ctx.shadowBlur = 3;
  }

  ctx.fillText(row.time, 80, yPos);
  ctx.fillText(row.meter, 220, yPos);
  ctx.fillText(row.pace, 360, yPos);
  ctx.fillText(row.strokeRate, 520, yPos);
  ctx.fillText(row.heartRate, 600, yPos);

  ctx.shadowBlur = 0;

  // Draw pixelated separator lines
  if (index < rowData.length - 1) {
    ctx.fillStyle = colors.neonMagenta;
    // Create pixelated line effect
    for (let x = 60; x < 740; x += 8) {
      ctx.fillRect(x, yPos + 15, 4, 1);
    }
  }

  yPos += 35;
});

// Add some retro UI decorations
ctx.fillStyle = colors.neonCyan;
ctx.fillRect(60, 520, 4, 20);
ctx.fillRect(70, 525, 4, 15);
ctx.fillRect(80, 530, 4, 10);

ctx.fillStyle = colors.neonMagenta;
ctx.fillRect(720, 520, 4, 20);
ctx.fillRect(710, 525, 4, 15);
ctx.fillRect(700, 530, 4, 10);

// Add terminal-style footer
ctx.fillStyle = colors.orange;
ctx.shadowColor = colors.orange;
ctx.shadowBlur = 6;
ctx.font = '14px monospace';
ctx.fillText('SYSTEM_STATUS: ACTIVE | DATA_STREAM: LIVE', 60, 560);
ctx.shadowBlur = 0;

// Add some glitch effect elements
ctx.fillStyle = colors.neonMagenta;
ctx.globalAlpha = 0.7;
ctx.fillRect(650, 100, 2, 400);
ctx.fillRect(680, 150, 3, 300);
ctx.globalAlpha = 1;

// Save the image
const buffer: Buffer = canvas.toBuffer('image/png');
writeFileSync('./canvas/images/cyberpunk-pm5-display.png', buffer);

console.log('Cyberpunk 2077 style PM5 display saved as cyberpunk-pm5-display.png');

// Export interface for module usage
interface CyberpunkPM5Display {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  colors: CyberpunkColors;
}

// // Optional: Export for further manipulation
// export const cyberpunkPM5Display: CyberpunkPM5Display = { canvas, ctx, colors };
// export { Canvas, CanvasRenderingContext2D, WorkoutRow, CyberpunkColors };
