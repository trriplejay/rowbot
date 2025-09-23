

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

type LogbookUser = {
  id: number,
  username: string,
  profileImageUrl: string,
};

type LogbookSplit = {
  time: number,
  distance: number,
  strokeRate: number,
  avgHeartRate: number,
}

type LogbookInterval = {
  type: "distance" | "time",
  distance: number,
  time: number,
  strokeRate: number,
  avgHeartRate: number,
}

type LogbookWorkout = {
  intervals: LogbookInterval[] | null,
  splits: LogbookSplit[] | null,

}

type LogbookResult = {
  id: number,
  distance: number,
  time: number,
  date: Date,
  strokeRate: number,
  workout: LogbookWorkout,

};

export function GetLogbookClient(baseUrl: string, token: string) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": ""
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return {
    getCurrentUser: async function(): Promise<LogbookUser> {
      const response = await fetch(`${baseUrl}/api/users/me`, {headers});
      if (!response.ok) throw new Error('Failed to fetch user');

      const data: any = await response.json()

      return {
        id: data.data.id,
        username: data.data.username,
        profileImageUrl: data.data.profile_image
      } as LogbookUser
    },
    getResultById: async function(id: number): Promise<LogbookResult> {
      const response = await fetch(`${baseUrl}/api/users/me/results/${id}`, {headers});
      if (!response.ok) throw new Error(`Failed to fetch result with id ${id}`);

      const data: any = await response.json()
      const rawWorkout = data.data.workout;
      const formattedSplits: LogbookSplit[] = [];
      const formattedIntervals: LogbookInterval[] = [];

      if (rawWorkout?.splits) {
        for (const w of rawWorkout.splits) {
          if (!w) continue;
          formattedSplits.push({
            time: w.time,
            distance: w.distance,
            strokeRate: w.stroke_rate,
            avgHeartRate: w?.heart_rate?.average,
          } as LogbookSplit)
        };
      }
      if (rawWorkout?.intervals) {
        for (const i of rawWorkout.intervals) {
          if (!i) continue
          formattedIntervals.push({
            type: i.type,
            time: i.time,
            distance: i.distance,
            strokeRate: i.stroke_rate,
            avgHeartRate: i?.heart_rate?.average,
          } as LogbookInterval);
        }
      }
      const logbookResult: LogbookResult = {
        id: data.data.id,
        strokeRate: data.data.stroke_rate,
        distance: data.data.distance,
        time: data.data.time,
        date: data.data.date,
        workout: {
          intervals: formattedIntervals,
          splits: formattedSplits,
        }
      };
      return logbookResult;
    },
    getTokenFromAuthCode: async function(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<TokenData> {
      const response = await fetch(`${baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }
      return await response.json() as TokenData;
    },
    getTokenFromRefreshCode: async function(refreshToken: string, clientId: string, clientSecret: string): Promise<TokenData> {
      const response = await fetch(`${baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'user:read,results:read',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }
      return await response.json() as TokenData;
    }
  }
}
