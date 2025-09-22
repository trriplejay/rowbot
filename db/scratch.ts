import { connect } from '@tursodatabase/serverless';

// initialize the database tables.

console.log(`connecting to database at ${process.env.TURSO_DATABASE_URL}`)
const conn = connect({
    url: process.env.TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  });

const stmt = conn.prepare("SELECT * FROM USERS")

for await (const row of stmt.iterate()) {
  console.log(row);
}
