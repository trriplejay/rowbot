


type LogbookUser = {
  id: number,
  username: string,
  profileImageUrl: string,
};

type LogbookResult = {
  id: number,
  distance: number,
  time: number,
  date: Date
};

export function GetLogbookClient(baseUrl: string, token: string) {
  const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }


  return {
    getCurrentUser: async function(): Promise<LogbookUser> {
      const response = await fetch(`${baseUrl}/api/users/me`, {headers});
      if (!response.ok) throw new Error('Failed to fetch user');

      const data: any = await response.json()

      console.log(data)
      return {
        id: data.data.id,
        username: data.data.username,
        profileImageUrl: data.data.profile_image
      } as LogbookUser
    }
  }
}
