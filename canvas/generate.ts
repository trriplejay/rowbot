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

interface Colors {
  displayGreen: string;
  displayDarkGreen: string;
  black: string;
  borderDark: string;
}

// Create canvas matching the display proportions (more landscape)
const canvas: Canvas = createCanvas(700, 500);
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

// Retro 8-bit color palette
const colors: Colors = {
  displayGreen: '#00ff41',  // Bright terminal green
  displayDarkGreen: '#00cc33', // Darker retro green
  black: '#000000',
  borderDark: '#00aa00'  // Green border for retro CRT feel
};

// Fill background with retro black for authentic CRT look
ctx.fillStyle = colors.black;
ctx.fillRect(0, 0, 700, 500);

// Create retro screen area with green background
ctx.fillStyle = colors.displayGreen;
ctx.fillRect(8, 8, 684, 484);

// Chunky 8-bit style outer border (double border effect)
ctx.strokeStyle = colors.borderDark;
ctx.lineWidth = 8;
ctx.strokeRect(0, 0, 700, 500);
ctx.strokeStyle = colors.displayDarkGreen;
ctx.lineWidth = 4;
ctx.strokeRect(4, 4, 692, 492);

// Distance and date section - retro monospace styling
ctx.fillStyle = colors.black;
ctx.font = 'bold 36px "Courier New", monospace';
ctx.fillText('>>> 8000M <<<', 30, 70);
ctx.font = 'bold 20px "Courier New", monospace';
ctx.fillText('[ SEP 17, 2025 ]', 30, 110);

// Retro table headers section with chunky styling
ctx.fillStyle = colors.black;
ctx.fillRect(20, 140, 660, 45);
ctx.fillStyle = colors.displayDarkGreen;
ctx.fillRect(24, 144, 652, 37);

// 8-bit style table headers
ctx.fillStyle = colors.black;
ctx.font = 'bold 18px "Courier New", monospace';
ctx.fillText('TIME', 40, 168);
ctx.fillText('DIST', 160, 168);
ctx.fillText('PACE', 280, 168);
ctx.fillText('SPM', 420, 168);
ctx.fillText('BPM', 520, 168);
ctx.fillText('AVG', 600, 168);

// Chunky 8-bit header border
ctx.strokeStyle = colors.black;
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(20, 185);
ctx.lineTo(680, 185);
ctx.stroke();

// Table rows data
const rowData: WorkoutRow[] = [
  { time: '36:07.1', meter: '8000', pace: '2:15.4', strokeRate: '19', heartRate: '143' },
  { time: '7:15.7', meter: '1600', pace: '2:16.1', strokeRate: '18', heartRate: '104' },
  { time: '7:13.4', meter: '3200', pace: '2:15.4', strokeRate: '19', heartRate: '149' },
  { time: '7:11.3', meter: '4800', pace: '2:14.7', strokeRate: '19', heartRate: '150' },
  { time: '7:15.4', meter: '6400', pace: '2:16.0', strokeRate: '19', heartRate: '150' },
  { time: '7:11.2', meter: '8000', pace: '2:14.7', strokeRate: '20', heartRate: '163' }
];

// First row highlighting with 8-bit chunky style
ctx.fillStyle = colors.black;
ctx.fillRect(20, 190, 660, 40);
ctx.fillStyle = colors.displayDarkGreen;
ctx.fillRect(24, 194, 652, 32);

// Draw all table rows with retro monospace font
ctx.font = 'bold 16px "Courier New", monospace';
let yPos: number = 218;

rowData.forEach((row: WorkoutRow, index: number) => {
  ctx.fillStyle = colors.black;
  ctx.fillText(row.time, 40, yPos);
  ctx.fillText(row.meter, 160, yPos);
  ctx.fillText(row.pace, 280, yPos);
  ctx.fillText(row.strokeRate, 420, yPos);
  ctx.fillText(row.heartRate, 520, yPos);

  // Draw chunky 8-bit horizontal line after each row (except the last)
  if (index < rowData.length - 1) {
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(24, yPos + 18);
    ctx.lineTo(676, yPos + 18);
    ctx.stroke();
  }

  yPos += 38;
});

// Save the retro 8-bit styled image
const buffer: Buffer = canvas.toBuffer('image/png');
writeFileSync('./retro-8bit-pm5-display.png', buffer);

console.log('Retro 8-bit PM5 display saved as retro-8bit-pm5-display.png');

// Export interface for module usage
interface PM5Display {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  colors: Colors;
}

// // Optional: Export for further manipulation
// export const pm5Display: PM5Display = { canvas, ctx, colors };
// export { Canvas, CanvasRenderingContext2D, WorkoutRow, Colors };
