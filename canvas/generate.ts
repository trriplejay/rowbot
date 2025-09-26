import { createCanvas, Canvas, CanvasRenderingContext2D } from "canvas";
import {
  calculatePace,
  formatTime,
  type LogbookResult,
} from "../logbook/client";

// Define types for better type safety
interface WorkoutRow {
  time: string;
  meter: string;
  pace: string;
  strokeRate: string;
}

interface DaisyForestColors {
  base100: string; // Main background
  base200: string; // Secondary background
  base300: string; // Tertiary background
  baseContent: string; // Light text
  primary: string; // Primary green
  secondary: string; // Secondary teal
  accent: string; // Accent cyan
  neutral: string; // Neutral gray
}

// // Helper function to format pace (time per 500m)
// function formatPace(timeInSeconds: number, distanceInMeters: number): string {
//   const paceSeconds = (timeInSeconds / distanceInMeters) * 500;
//   const minutes = Math.floor(paceSeconds / 60);
//   const seconds = paceSeconds % 60;
//   return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
// }

// Helper function to format distance
function formatDistance(meters: number): string {
  return meters.toString();
}

// Helper function to format stroke rate
function formatStrokeRate(rate: number): string {
  return rate ? rate.toString() : "0";
}

export function generateWorkoutDisplay(
  username: string,
  logbookResult: LogbookResult,
): Buffer {
  // DaisyUI Forest theme color palette
  const colors: DaisyForestColors = {
    base100: "#1F2937", // Main dark background
    base200: "#111827", // Darker background
    base300: "#0F172A", // Darkest background
    baseContent: "#F9FAFB", // Light text
    primary: "#22C55E", // Primary green
    secondary: "#14B8A6", // Secondary teal
    accent: "#06B6D4", // Accent cyan
    neutral: "#374151", // Neutral gray
  };

  // Prepare workout data
  const workoutRows: WorkoutRow[] = [];

  // Add main workout row
  workoutRows.push({
    time: formatTime(logbookResult.time),
    meter: formatDistance(logbookResult.distance),
    pace: formatTime(calculatePace(logbookResult.distance, logbookResult.time)),
    strokeRate: formatStrokeRate(logbookResult.strokeRate),
  });

  // Add splits or intervals if available
  if (logbookResult.workout.splits && logbookResult.workout.splits.length > 0) {
    for (const split of logbookResult.workout.splits) {
      workoutRows.push({
        time: formatTime(split.time),
        meter: formatDistance(split.distance),
        pace: formatTime(calculatePace(split.distance, split.time)),
        strokeRate: formatStrokeRate(split.strokeRate),
      });
    }
  } else if (
    logbookResult.workout.intervals &&
    logbookResult.workout.intervals.length > 0
  ) {
    for (const interval of logbookResult.workout.intervals) {
      workoutRows.push({
        time: formatTime(interval.time),
        meter: formatDistance(interval.distance),
        pace: formatTime(calculatePace(interval.distance, interval.time)),
        strokeRate: formatStrokeRate(interval.strokeRate),
      });
    }
  }

  // Calculate dynamic height based on number of rows
  const baseHeight = 270; // Base height for headers, borders, footer (reduced by 30)
  const rowHeight = 28;
  const totalHeight = baseHeight + workoutRows.length * rowHeight;

  // Create canvas with dynamic height
  const canvas: Canvas = createCanvas(550, totalHeight);
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  // Fill background with base color
  ctx.fillStyle = colors.base300;
  ctx.fillRect(0, 0, 550, totalHeight);

  // Add some retro scanlines effect
  ctx.strokeStyle = colors.neutral;
  ctx.lineWidth = 1;
  for (let i = 0; i < totalHeight; i += 4) {
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(550, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Outer border with glow effect
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = colors.primary;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, 510, totalHeight - 40);
  ctx.shadowBlur = 0;

  // Inner border
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 2;
  ctx.shadowColor = colors.secondary;
  ctx.shadowBlur = 10;
  ctx.strokeRect(40, 40, 470, totalHeight - 80);
  ctx.shadowBlur = 0;

  // Terminal header with date
  ctx.fillStyle = colors.accent;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 8;
  ctx.font = "bold 20px monospace";
  const dateStr = logbookResult.date
    ? new Date(logbookResult.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  ctx.fillText(`>>> ${dateStr} <<<`, 60, 80);
  ctx.shadowBlur = 0;

  // Add some retro UI elements
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(60, 90, 200, 2);
  ctx.fillRect(60, 95, 150, 2);
  ctx.fillRect(60, 100, 100, 2);

  // Table headers section
  ctx.fillStyle = colors.base200;
  ctx.fillRect(60, 120, 430, 40);

  // Border for header
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 8;
  ctx.strokeRect(60, 120, 430, 40);
  ctx.shadowBlur = 0;

  // Table headers with font
  ctx.fillStyle = colors.baseContent;
  ctx.shadowColor = colors.baseContent;
  ctx.shadowBlur = 5;
  ctx.font = "bold 16px monospace";

  // Right-align all headers to match the data columns
  ctx.textAlign = "right";
  ctx.fillText("TIME", 160, 145);
  ctx.fillText("METERS", 260, 145);
  ctx.fillText("PACE/500M", 400, 145);
  ctx.fillText("S/MIN", 480, 145);
  ctx.shadowBlur = 0;

  // Use the prepared workout data
  const rowData = workoutRows;

  // First row highlighting
  ctx.fillStyle = colors.base200;
  ctx.fillRect(60, 170, 430, 30);
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 2;
  ctx.shadowColor = colors.secondary;
  ctx.shadowBlur = 6;
  ctx.strokeRect(60, 170, 430, 30);
  ctx.shadowBlur = 0;

  // Draw all table rows with DaisyUI styling
  ctx.font = "14px monospace";
  let yPos: number = 190;

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

    // Right-align all columns for better alignment of numeric data
    ctx.textAlign = "right";
    ctx.fillText(row.time, 160, yPos);
    ctx.fillText(row.meter, 260, yPos);
    ctx.fillText(row.pace, 400, yPos);
    ctx.fillText(row.strokeRate, 480, yPos);

    ctx.shadowBlur = 0;

    // Draw pixelated separator lines
    if (index < rowData.length - 1) {
      ctx.fillStyle = colors.neutral;
      // Create pixelated line effect
      for (let x = 60; x < 490; x += 8) {
        ctx.fillRect(x, yPos + 12, 4, 1);
      }
    }

    yPos += 28;
  });

  // Add some UI decorations (adjust position based on dynamic height)
  const decorationY = totalHeight - 80;
  ctx.fillStyle = colors.primary;
  ctx.fillRect(60, decorationY, 4, 15);
  ctx.fillRect(70, decorationY + 5, 4, 10);
  ctx.fillRect(80, decorationY + 10, 4, 8);

  ctx.fillStyle = colors.secondary;
  ctx.fillRect(470, decorationY, 4, 15);
  ctx.fillRect(460, decorationY + 5, 4, 10);
  ctx.fillRect(450, decorationY + 10, 4, 8);

  // Return the image buffer
  const buffer: Buffer = canvas.toBuffer("image/png");
  return buffer;
}

// Export interface for module usage
export interface DaisyForestPM5Display {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  colors: DaisyForestColors;
}

// Export types
export type { WorkoutRow, DaisyForestColors };
