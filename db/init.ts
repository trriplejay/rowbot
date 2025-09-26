import { connect } from "@tursodatabase/serverless";

// initialize the database tables.

console.log(`connecting to database at ${process.env.TURSO_DATABASE_URL}`);
const conn = connect({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

console.log("creating tables...");
await conn.exec(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, logbook_id INTEGER NOT NULL UNIQUE, logbook_username TEXT NOT NULL UNIQUE, profile_image_url TEXT, access_token TEXT, refresh_token TEXT)",
);
