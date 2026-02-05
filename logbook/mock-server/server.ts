import { serve } from "bun";

// Mock data storage - you can easily modify these
const mockUsers = {
  me: {
    data: {
      id: 1688,
      username: "test_user",
      profile_image: "https://example.com/avatar.jpg",
    },
  },
};

// Custom workout results by ID - you can add or modify these easily
const mockWorkoutResults: Record<number, any> = {
  1: {
    type: "result-added",
    result: {
      id: 1,
      user_id: 1688
    },
    data: {
      distance: 8000,
      time: 21671, // 36:07.1 in tenths of seconds
      date: "2025-09-17T12:00:00Z",
      stroke_rate: 19,
      heart_rate: { average: 150 },
      workout_type: "JustRow",
      workout: {
        intervals: null,
        splits: [
          {
            time: 4357, // 07:15.7 in tenths
            distance: 1600,
            stroke_rate: 18,
            heart_rate: { average: 104 },
          },
          {
            time: 4334, // 07:13.4 in tenths
            distance: 3200,
            stroke_rate: 19,
            heart_rate: { average: 149 },
          },
          {
            time: 4313, // 07:11.3 in tenths
            distance: 4800,
            stroke_rate: 19,
            heart_rate: { average: 150 },
          },
          {
            time: 4354, // 07:15.4 in tenths
            distance: 6400,
            stroke_rate: 19,
            heart_rate: { average: 150 },
          },
          {
            time: 4312, // 07:11.2 in tenths
            distance: 8000,
            stroke_rate: 20,
            heart_rate: { average: 163 },
          },
        ],
      },
    },
  },
  2: {
    type: "result-added",
    result: {
      id: 2,
      user_id: 1688,
    },
    data: {
      distance: 2000,
      time: 4800, // 8:00.0 in tenths of seconds
      date: "2025-09-18T10:30:00Z",
      stroke_rate: 22,
      heart_rate: { average: 165 },
      workout_type: "FixedDistanceSplits",
      workout: {
        intervals: null,
        splits: [
          {
            time: 2400, // 4:00.0 in tenths
            distance: 1000,
            stroke_rate: 24,
            heart_rate: { average: 160 },
          },
          {
            time: 2400, // 4:00.0 in tenths
            distance: 2000,
            stroke_rate: 20,
            heart_rate: { average: 170 },
          },
        ],
      },
    },
  },
  3: {
    type: "result-added",
    result: {
      id: 3,
      user_id: 1688,
    },
    data: {
      user_id: 1890109,
      distance: 4000,
      weight_class: "H",
      drag_factor: 133,
      time: 9543,
      stroke_data: false,
      calories_total: 265,
      workout: {
        intervals: [
          {
            calories_total: 66,
            rest_time: 3000,
            stroke_rate: 23,
            heart_rate: {
              rest: 112,
              average: 101,
              ending: 112,
              recovery: 0,
              max: 115,
              min: 77,
            },
            time: 2396,
            distance: 1000,
            type: "distance",
          }, {
            type: "distance",
            distance: 1000,
            calories_total: 66,
            stroke_rate: 24,
            rest_time: 3000,
            heart_rate: {
              max: 137,
              rest: 126,
              min: 98,
              ending: 121,
              average: 115,
              recovery: 0,
            },
            time: 2389,
          }, {
            distance: 1000,
            heart_rate: {
              ending: 118,
              min: 109,
              recovery: 0,
              rest: 108,
              max: 138,
              average: 122,
            },
            type: "distance",
            stroke_rate: 24,
            time: 2396,
            calories_total: 66,
            rest_time: 3000,
          }, {
            rest_time: 3000,
            heart_rate: {
              min: 103,
              ending: 118,
              max: 156,
              average: 120,
              recovery: 0,
              rest: 109,
            },
            stroke_rate: 24,
            type: "distance",
            time: 2362,
            distance: 1000,
            calories_total: 67,
          }
        ],
        targets: {
          heart_rate_zone: 0,
        },
      },
      comments: null,
      id: 112380398,
      rest_time: 12000,
      verified: true,
      rest_distance: 84,
      real_time: null,
      stroke_rate: 23,
      workout_type: "FixedDistanceInterval",
      heart_rate: {
        recovery: 0,
        max: 0,
        ending: 117,
        min: 0,
        average: 117,
      },
      stroke_count: 376,
      source: "ErgData Android",
      time_formatted: "35:54.3",
      privacy: "partners",
      type: "rower",
      ranked: false,
      date: "2026-02-04 11:53:00",
      date_utc: "2026-02-04 19:53:00",
      timezone: "America/Los_Angeles",
    },
  }
};



// Mock token responses
const mockTokens = {
  access_token: "mock_access_token_12345",
  refresh_token: "mock_refresh_token_67890",
  expires_in: 3600,
};

const server = serve({
  port: 3001, // Run on port 3001 to avoid conflicts
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    console.log(`${method} ${url.pathname}`);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    try {
      // Handle preflight requests
      if (method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      if (url.pathname.startsWith("/sendit") && method === "POST") {
        const id = parseInt(url.pathname.split("/").pop() || "0");
        console.log("found result id", id);
        // just using the default port for the local server
        const response = await fetch("http://localhost:3000/webhook", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mockWorkoutResults[id] || {}),
        });
        if (!response.ok) console.log(new Error("Failed to send local hook"));
        return new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Route: GET /api/users/me
      if (url.pathname === "/api/users/me" && method === "GET") {

        return new Response(JSON.stringify(mockUsers.me), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Route: GET /api/users/me/results/:id
      if (
        url.pathname.startsWith("/api/users/me/results/") &&
        method === "GET"
      ) {
        const id = parseInt(url.pathname.split("/").pop() || "0");

        if (mockWorkoutResults[id]) {
          console.log(`Returning mock workout result for ID: ${id}`);
          return new Response(JSON.stringify(mockWorkoutResults[id]), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } else {
          // Return a default workout if ID not found
          console.log(`Workout ID ${id} not found, returning default`);
          const defaultWorkout = {
            data: {
              id: id,
              distance: 5000,
              time: 12000, // 20:00.0 in tenths
              date: new Date().toISOString(),
              stroke_rate: 20,
              heart_rate: { average: 155 },
              workout_type: "JustRow",
              workout: {
                intervals: null,
                splits: [
                  {
                    time: 12000, // 20:00.0 in tenths
                    distance: 5000,
                    stroke_rate: 20,
                    heart_rate: { average: 155 },
                  },
                ],
              },
            },
          };
          return new Response(JSON.stringify(defaultWorkout), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }

      // Route: POST /oauth/access_token
      if (url.pathname === "/oauth/access_token" && method === "POST") {
        const body = await req.text();
        const params = new URLSearchParams(body);
        const grantType = params.get("grant_type");

        console.log(`Token request with grant_type: ${grantType}`);

        if (
          grantType === "authorization_code" ||
          grantType === "refresh_token"
        ) {
          return new Response(JSON.stringify(mockTokens), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } else {
          return new Response(JSON.stringify({ error: "invalid_grant" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (error: any) {
      console.error("Server error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
});

console.log("🚀 Concept2 Mock Server running on http://localhost:3001");
console.log("📝 Mock endpoints available:");
console.log("   GET  /api/users/me");
console.log("   GET  /api/users/me/results/:id");
console.log("   POST /oauth/access_token");
console.log(
  "\n💡 To add custom workout results, modify the mockWorkoutResults object in server.ts",
);
console.log(
  "\n🔗 Use this as your CONCEPT2_API_BASE_URL: http://localhost:3001",
);
