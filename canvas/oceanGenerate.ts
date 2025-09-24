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

interface OceanColors {
  deepNavy: string;
  oceanBlue: string;
  lightBlue: string;
  foam: string;
  primary: string;
  secondary: string;
  accent: string;
}

// Create canvas
const canvas: Canvas = createCanvas(800, 600);
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

// Ocean/Rowing theme color palette
const colors: OceanColors = {
  deepNavy: '#1e3a8a',
  oceanBlue: '#3b82f6',
  lightBlue: '#60a5fa',
  foam: '#f8fafc',
  primary: '#ffffff',
  secondary: '#cbd5e1',
  accent: '#06b6d4'
};

// Create gradient background (ocean depths)
const gradient = ctx.createLinearGradient(0, 0, 0, 600);
gradient.addColorStop(0, colors.lightBlue);
gradient.addColorStop(0.3, colors.oceanBlue);
gradient.addColorStop(1, colors.deepNavy);
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 800, 600);

// Add subtle wave pattern in background
ctx.strokeStyle = colors.primary + '10';
ctx.lineWidth = 2;
for (let y = 0; y < 600; y += 60) {
  ctx.beginPath();
  for (let x = 0; x <= 800; x += 20) {
    const waveHeight = Math.sin((x + y) * 0.02) * 8;
    if (x === 0) {
      ctx.moveTo(x, y + waveHeight);
    } else {
      ctx.lineTo(x, y + waveHeight);
    }
  }
  ctx.stroke();
}

// Flowing border with wave effect
ctx.strokeStyle = colors.foam;
ctx.lineWidth = 3;
ctx.shadowColor = colors.foam;
ctx.shadowBlur = 10;
ctx.strokeRect(40, 40, 720, 520);
ctx.shadowBlur = 0;

// Title area with nautical styling
ctx.fillStyle = colors.primary;
ctx.shadowColor = colors.primary;
ctx.shadowBlur = 8;
ctx.font = 'bold 40px "Trebuchet MS", Helvetica, sans-serif';
ctx.fillText('8000m', 60, 100);
ctx.shadowBlur = 0;

// Rowing icon representation (simplified oars)
ctx.strokeStyle = colors.accent;
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(250, 85);
ctx.lineTo(290, 85);
ctx.moveTo(270, 75);
ctx.lineTo(270, 95);
ctx.stroke();

ctx.fillStyle = colors.secondary;
ctx.font = '18px "Trebuchet MS", Helvetica, sans-serif';
ctx.fillText('September 17, 2025', 60, 130);

// Wave-inspired divider
ctx.strokeStyle = colors.accent;
ctx.lineWidth = 3;
ctx.beginPath();
for (let x = 60; x <= 300; x += 5) {
  const waveY = 150 + Math.sin(x * 0.1) * 3;
  if (x === 60) {
    ctx.moveTo(x, waveY);
  } else {
    ctx.lineTo(x, waveY);
  }
}
ctx.stroke();

// Table headers with ocean-inspired styling
const headerGradient = ctx.createLinearGradient(0, 170, 0, 220);
headerGradient.addColorStop(0, colors.oceanBlue + '80');
headerGradient.addColorStop(1, colors.deepNavy + '80');
ctx.fillStyle = headerGradient;
ctx.fillRect(60, 170, 680, 50);

// Flowing border for header
ctx.strokeStyle = colors.accent;
ctx.lineWidth = 2;
ctx.shadowColor = colors.accent;
ctx.shadowBlur = 6;
ctx.strokeRect(60, 170, 680, 50);
ctx.shadowBlur = 0;

ctx.fillStyle = colors.primary;
ctx.shadowColor = colors.primary;
ctx.shadowBlur = 4;
ctx.font = 'bold 14px "Trebuchet MS", Helvetica, sans-serif';
ctx.fillText('TIME', 80, 195);
ctx.fillText('DISTANCE', 200, 195);
ctx.fillText('PACE /500M', 340, 195);
ctx.fillText('STROKE', 480, 195);
ctx.fillText('HEART', 580, 195);
ctx.shadowBlur = 0;

// Table rows data
const rowData: WorkoutRow[] = [
  { time: '36:07.1', meter: '8000', pace: '2:15.4', strokeRate: '19', heartRate: '143' },
  { time: '7:15.7', meter: '1600', pace: '2:16.1', strokeRate: '18', heartRate: '104' },
  { time: '7:13.4', meter: '3200', pace: '2:15.4', strokeRate: '19', heartRate: '149' },
  { time: '7:11.3', meter: '4800', pace: '2:14.7', strokeRate: '19', heartRate: '150' },
  { time: '7:15.4', meter: '6400', pace: '2:16.0', strokeRate: '19', heartRate: '150' },
  { time: '7:11.2', meter: '8000', pace: '2:14.7', strokeRate: '20', heartRate: '163' }
];

// Draw table rows with flowing water theme
let yPos: number = 240;
ctx.font = '16px "Trebuchet MS", Helvetica, sans-serif';

rowData.forEach((row: WorkoutRow, index: number) => {
  // Highlight first row with flowing accent
  if (index === 0) {
    const rowGradient = ctx.createLinearGradient(60, yPos - 20, 740, yPos + 20);
    rowGradient.addColorStop(0, colors.accent + '30');
    rowGradient.addColorStop(0.5, colors.accent + '50');
    rowGradient.addColorStop(1, colors.accent + '30');
    ctx.fillStyle = rowGradient;
    ctx.fillRect(60, yPos - 20, 680, 40);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 8;
    ctx.strokeRect(60, yPos - 20, 680, 40);
    ctx.shadowBlur = 0;
  }

  // Gentle alternating backgrounds like water depths
  if (index > 0 && index % 2 === 1) {
    ctx.fillStyle = colors.deepNavy + '20';
    ctx.fillRect(60, yPos - 20, 680, 40);
  }

  // Text with ocean-appropriate colors
  ctx.fillStyle = index === 0 ? colors.accent : colors.primary;
  ctx.shadowColor = index === 0 ? colors.accent : colors.primary;
  ctx.shadowBlur = index === 0 ? 4 : 2;

  ctx.fillText(row.time, 80, yPos);
  ctx.fillText(row.meter, 200, yPos);
  ctx.fillText(row.pace, 360, yPos);
  ctx.fillText(row.strokeRate, 500, yPos);
  ctx.fillText(row.heartRate, 600, yPos);

  ctx.shadowBlur = 0;

  // Flowing separator lines like gentle waves
  if (index < rowData.length - 1) {
    ctx.strokeStyle = colors.secondary + '60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 60; x <= 740; x += 10) {
      const waveY = yPos + 10 + Math.sin(x * 0.05) * 1;
      if (x === 60) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  }

  yPos += 40;
});

// Nautical footer with water elements
ctx.fillStyle = colors.accent;
for (let i = 0; i < 3; i++) {
  ctx.beginPath();
  ctx.arc(70 + i * 8, 530, 2, 0, Math.PI * 2);
  ctx.fill();
}

ctx.fillStyle = colors.secondary;
ctx.shadowColor = colors.secondary;
ctx.shadowBlur = 3;
ctx.font = '12px "Trebuchet MS", Helvetica, sans-serif';
ctx.fillText('Rowing Performance • On the Water', 110, 535);
ctx.shadowBlur = 0;

// Decorative water drops
ctx.fillStyle = colors.lightBlue;
ctx.globalAlpha = 0.6;
ctx.beginPath();
ctx.arc(720, 80, 3, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(710, 95, 2, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(730, 110, 2.5, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1;

// Save the image
const buffer: Buffer = canvas.toBuffer('image/png');
writeFileSync('./canvas/images/ocean-rowing-theme-pm5.png', buffer);

console.log('Ocean/Rowing Theme PM5 display saved as ocean-rowing-theme-pm5.png');
