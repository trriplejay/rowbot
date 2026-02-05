import { connect, Connection } from "@tursodatabase/serverless";

export type User = {
  id: number;
  logbookId: number;
  logbookUsername: string;
  profileImageUrl: string;
  accessToken: string;
  refreshToken: string;
};

export function GetDBClient(url: string, authToken: string) {
  const conn = connect({
    url,
    authToken,
  });
  return {
    getUserByLogbookId: async function (id: number): Promise<User> {
      const stmt = conn.prepare("SELECT * FROM users WHERE logbook_id = ?");
      const result = await stmt.get([id]);
      if (!result) {
        throw new Error(`user not found for logbookId: ${id}`)
      }

      return {
        id: result.id,
        logbookId: result.logbook_id,
        logbookUsername: result.logbook_username,
        profileImageUrl: result.profile_image_url,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      } as User;
    },
    createUser: async function (
      logbookId: number,
      logbookUsername: string,
      profileImageUrl: string,
      accessToken: string,
      refreshToken: string,
    ): Promise<void> {
      console.log(
        `creating user with id ${logbookId} and username ${logbookUsername}`,
      );

      const stmt = conn.prepare(`
          INSERT INTO users (logbook_id, logbook_username, profile_image_url, access_token, refresh_token)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT (logbook_id) DO UPDATE SET logbook_username = ?, profile_image_url = ?, access_token = ?, refresh_token = ?;
        `);

      await stmt.run([
        logbookId,
        logbookUsername,
        profileImageUrl,
        accessToken,
        refreshToken,
        logbookUsername,
        profileImageUrl,
        accessToken,
        refreshToken,
      ]);
    },
    updateUser: async function (
      logbookId: number,
      accessToken: string,
      refreshToken: string,
    ): Promise<void> {
      const stmt = conn.prepare(`
        UPDATE users SET access_token = ?, refresh_token = ? WHERE logbook_id = ?
      `);

      await stmt.run([accessToken, refreshToken, logbookId]);
    },
  };
}
