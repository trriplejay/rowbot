# Concept2 Mock Server

A quick and dirty mock server for testing the Concept2 Logbook API locally.

## Setup

1. Navigate to the mock-server directory:

```bash
cd mock-server
```

2. Install dependencies (if needed):

```bash
bun install
```

## Running the Server

Start the mock server:

```bash
bun run start
```

The server will run on `http://localhost:3001`

## Using with Your Application

To use this mock server with your main application, set the environment variable:

```bash
export CONCEPT2_API_BASE_URL=http://localhost:3001
```

Then run your main application:

```bash
bun run index.ts
```

## Available Endpoints

- `GET /api/users/me` - Returns mock user data
- `GET /api/users/me/results/:id` - Returns workout result by ID
- `POST /oauth/access_token` - Handles token exchange

## Customizing Data

### Adding Custom Workout Results

Edit the `mockWorkoutResults` object in `server.ts` to add custom workout data:

```typescript
const mockWorkoutResults: Record<number, any> = {
  12345: {
    data: {
      id: 12345,
      distance: 8000,
      time: 21671, // 36:07.1 in tenths of seconds
      date: "2025-09-17T12:00:00Z",
      stroke_rate: 19,
      heart_rate: { average: 150 },
      workout_type: "JustRow",
      workout: {
        intervals: null,
        splits: [
          // Your split data here
        ],
      },
    },
  },
  // Add more workout IDs as needed
};
```

### Custom User Data

Modify the `mockUsers` object to change user information:

```typescript
const mockUsers = {
  me: {
    data: {
      id: 12345,
      username: "your_test_user",
      profile_image: "https://example.com/your-avatar.jpg",
    },
  },
};
```

## Testing

The server logs all incoming requests to help with debugging. When requesting a workout result by ID that doesn't exist in `mockWorkoutResults`, it will return a default workout with the requested ID.

## Example Usage

```bash
# Terminal 1: Start mock server
cd mock-server
bun run start

# Terminal 2: Run your application with mock API
cd ..
export CONCEPT2_API_BASE_URL=http://localhost:3001
bun run index.ts
```
