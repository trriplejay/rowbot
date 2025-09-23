#!/bin/bash -e
source $(pwd)/.env
# Using curl
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "embeds": [{
   "title":":person_rowing_boat: Congrats trriplejay!",
   "description":"You completed a rowing activity!",
   "color":65280,
   "thumbnail":{
      "url":"https://example.com/server-icon.png"
   },
   "fields":[

      {
         "name":"Distance",
         "value":"8000m",
         "inline": true
      },
      {
         "name":"Time",
         "value":"35:22",
         "inline": true
      },
      {
         "name":"Avg/500",
         "value":"2:17.3",
         "inline": true
      },
      {
        "name": "Splits",
        "value": "",
        "inline": true
      },
      {
        "name": "s/m",
        "value": "",
        "inline": true
      },
      {
        "name": "Avg/500",
        "value": "",
        "inline": true
      },
      {
        "name": "",
        "value": "1000",
        "inline": true
      },
      {
        "name": "",
        "value": "21",
        "inline": true
      },
      {
        "name": "",
        "value": "2:18.1",
        "inline": true
      },
      {
        "name": "",
        "value": ":two:     2000     19.1    2:16.9\n:three:     3000     18.6    2:16.5"
      }
   ],
   "footer":{
      "text":"nice work!",
      "icon_url":"https://example.com/bot-icon.png"
   },
   "timestamp":"2025-09-18T23:54:34.853Z"
   }]
}'
