

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

interface MinimalistColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
}

// Create canvas
const canvas: Canvas = createCanvas(800, 600);
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

// Minimalist Modern color palette
const colors: MinimalistColors = {
  background: '#f8f9fa',
  primary: '#212529',
  secondary: '#6c757d',
  accent: '#007bff',
  border: '#dee2e6'
};

// Fill background
ctx.fillStyle = colors.background;
ctx.fillRect(0, 0, 800, 600);

// Subtle outer border
ctx.strokeStyle = colors.border;
ctx.lineWidth = 1;
ctx.strokeRect(40, 40, 720, 520);

// Title area with clean typography
ctx.fillStyle = colors.primary;
ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('8000m', 60, 100);

ctx.fillStyle = colors.secondary;
ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('September 17, 2025', 60, 130);

// Subtle divider line
ctx.strokeStyle = colors.border;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(60, 150);
ctx.lineTo(740, 150);
ctx.stroke();

// Table headers with minimal styling
ctx.fillStyle = colors.background;
ctx.fillRect(60, 170, 680, 50);

ctx.strokeStyle = colors.border;
ctx.strokeRect(60, 170, 680, 50);

ctx.fillStyle = colors.secondary;
ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.textAlign = 'left';
ctx.fillText('Time', 80, 195);
ctx.fillText('Distance', 200, 195);
ctx.fillText('Split /500m', 340, 195);
ctx.fillText('Rate', 480, 195);
ctx.fillText('Heart Rate', 580, 195);

// Table rows data
const rowData: WorkoutRow[] = [
  { time: '36:07.1', meter: '8000', pace: '2:15.4', strokeRate: '19', heartRate: '143' },
  { time: '7:15.7', meter: '1600', pace: '2:16.1', strokeRate: '18', heartRate: '104' },
  { time: '7:13.4', meter: '3200', pace: '2:15.4', strokeRate: '19', heartRate: '149' },
  { time: '7:11.3', meter: '4800', pace: '2:14.7', strokeRate: '19', heartRate: '150' },
  { time: '7:15.4', meter: '6400', pace: '2:16.0', strokeRate: '19', heartRate: '150' },
  { time: '7:11.2', meter: '8000', pace: '2:14.7', strokeRate: '20', heartRate: '163' }
];

// Draw table rows with clean styling
let yPos: number = 240;
ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';

rowData.forEach((row: WorkoutRow, index: number) => {
  // Highlight first row with subtle accent
  if (index === 0) {
    ctx.fillStyle = colors.accent + '0a'; // Very subtle blue tint
    ctx.fillRect(60, yPos - 20, 680, 40);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, yPos - 20, 680, 40);
  }

  // Alternate row backgrounds for better readability
  if (index > 0 && index % 2 === 0) {
    ctx.fillStyle = colors.background;
    ctx.fillRect(60, yPos - 20, 680, 40);
  }

  // Text color
  ctx.fillStyle = index === 0 ? colors.accent : colors.primary;

  ctx.fillText(row.time, 80, yPos);
  ctx.fillText(row.meter, 200, yPos);
  ctx.fillText(row.pace, 360, yPos);
  ctx.fillText(row.strokeRate, 500, yPos);
  ctx.fillText(row.heartRate, 600, yPos);

  // Subtle separator lines
  if (index < rowData.length - 1) {
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, yPos + 10);
    ctx.lineTo(740, yPos + 10);
    ctx.stroke();
  }

  yPos += 40;
});

// Clean footer
ctx.fillStyle = colors.secondary;
ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
ctx.fillText('Workout Summary • Data updated in real-time', 60, 540);

// Save the image
const buffer: Buffer = canvas.toBuffer('image/png');
writeFileSync('./canvas/images/minimalist-modern-pm5.png', buffer);

console.log('Minimalist Modern PM5 display saved as minimalist-modern-pm5.png');
