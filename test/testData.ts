import type { LogbookResult } from "../logbook/client";


// Test data 1: Workout with splits
export const testLogbookResultWithSplits: LogbookResult = {
  id: 12345,
  distance: 8000,
  time: 21671, // 36:07.1 in seconds
  date: new Date('2025-09-17'),
  strokeRate: 19,
  workout: {
    intervals: null,
    splits: [
      {
        time: 4357, // 07:15.7
        distance: 1600,
        strokeRate: 18,
        avgHeartRate: 104
      },
      {
        time: 4334, // 07:13.4
        distance: 3200,
        strokeRate: 19,
        avgHeartRate: 149
      },
      {
        time: 4313, // 07:11.3
        distance: 4800,
        strokeRate: 19,
        avgHeartRate: 150
      },
      {
        time: 4354, // 07:15.4
        distance: 6400,
        strokeRate: 19,
        avgHeartRate: 150
      },
      {
        time: 4312, // 07:11.2
        distance: 8000,
        strokeRate: 20,
        avgHeartRate: 163
      }
    ]
  }
};

// Test data 2: Workout with intervals
export const testLogbookResultWithIntervals: LogbookResult = {
  id: 54321,
  distance: 4000,
  time: 9005, // 15:00.5 in seconds
  date: new Date('2025-09-18'),
  strokeRate: 22,
  workout: {
    intervals: [
      {
        type: "distance",
        time: 3002, // 05:00.2
        distance: 1000,
        strokeRate: 24,
        avgHeartRate: 155
      },
      {
        type: "distance",
        time: 2988, // 04:58.8
        distance: 1000,
        strokeRate: 23,
        avgHeartRate: 165
      },
      {
        type: "distance",
        time: 3015, // 05:01.5
        distance: 1000,
        strokeRate: 22,
        avgHeartRate: 170
      }
    ],
    splits: null
  }
};

// Test data 3: Simple workout with no splits or intervals
export const testLogbookResultSimple: LogbookResult = {
  id: 99999,
  distance: 5000,
  time: 12000, // 20:00.0 in seconds
  date: new Date('2025-09-19'),
  strokeRate: 20,
  workout: {
    intervals: null,
    splits: null
  }
};

// Test data 4: Workout with 20 intervals to test dynamic height
export const testLogbookResultManyIntervals: LogbookResult = {
  id: 77777,
  distance: 10000,
  time: 24000, // 40:00.0 in seconds
  date: new Date('2025-09-20'),
  strokeRate: 24,
  workout: {
    intervals: [
      { type: "distance", time: 1205, distance: 500, strokeRate: 26, avgHeartRate: 140 },
      { type: "distance", time: 1192, distance: 500, strokeRate: 25, avgHeartRate: 145 },
      { type: "distance", time: 1189, distance: 500, strokeRate: 26, avgHeartRate: 155 },
      { type: "distance", time: 1218, distance: 500, strokeRate: 24, avgHeartRate: 150 },
      { type: "distance", time: 1201, distance: 500, strokeRate: 25, avgHeartRate: 158 },
      { type: "distance", time: 1223, distance: 500, strokeRate: 24, avgHeartRate: 160 },
      { type: "distance", time: 1197, distance: 500, strokeRate: 26, avgHeartRate: 162 },
      { type: "distance", time: 1212, distance: 500, strokeRate: 25, avgHeartRate: 165 },
      { type: "distance", time: 1185, distance: 500, strokeRate: 27, avgHeartRate: 168 },
      { type: "distance", time: 1208, distance: 500, strokeRate: 25, avgHeartRate: 170 },
      { type: "distance", time: 1221, distance: 500, strokeRate: 24, avgHeartRate: 172 },
      { type: "distance", time: 1193, distance: 500, strokeRate: 26, avgHeartRate: 175 },
      { type: "distance", time: 1216, distance: 500, strokeRate: 25, avgHeartRate: 177 },
      { type: "distance", time: 1182, distance: 500, strokeRate: 27, avgHeartRate: 179 },
      { type: "distance", time: 1204, distance: 500, strokeRate: 25, avgHeartRate: 180 },
      { type: "distance", time: 1237, distance: 500, strokeRate: 23, avgHeartRate: 181 },
      { type: "distance", time: 1219, distance: 500, strokeRate: 24, avgHeartRate: 182 },
      { type: "distance", time: 1198, distance: 500, strokeRate: 26, avgHeartRate: 183 },
      { type: "distance", time: 1225, distance: 500, strokeRate: 24, avgHeartRate: 184 },
      { type: "distance", time: 1200, distance: 500, strokeRate: 25, avgHeartRate: 185 }
    ],
    splits: null
  }
};

// Test data 5: Long workout over 1 hour to test time formatting
export const testLogbookResultLongWorkout: LogbookResult = {
  id: 55555,
  distance: 21097, // Half marathon distance
  time: 49260, // 1:22:06.0 in tenths of seconds (82:06.0)
  date: new Date('2025-09-21'),
  strokeRate: 22,
  workout: {
    intervals: null,
    splits: [
      {
        time: 12150, // 20:15.0
        distance: 5000,
        strokeRate: 23,
        avgHeartRate: 135
      },
      {
        time: 12300, // 20:30.0
        distance: 10000,
        strokeRate: 22,
        avgHeartRate: 145
      },
      {
        time: 12450, // 20:45.0
        distance: 15000,
        strokeRate: 21,
        avgHeartRate: 155
      },
      {
        time: 12360, // 20:36.0
        distance: 21097,
        strokeRate: 22,
        avgHeartRate: 165
      }
    ]
  }
};
