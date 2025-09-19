#!/bin/bash -e

HOOK_URL="https://discord.com/api/webhooks/1417757852705095720/oESlCb93l9-UIjAd30sz9txCbtguap-oFj2v2B7nbTx1d_xBLlseqZ7dDK-_eW6JuFdu"

# Using curl
curl -X POST "$HOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
  "embeds": [{
   "title":"🎉 Congrats <username>!",
   "description":"You completed a rowing activity! [logbook](https://www.google.com)",
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
        "name": "Split",
        "value": "",
        "inline": true
      },
      {
        "name": "Dist",
        "value": "",
        "inline": true
      },
      {
        "name": "Heart rate",
        "value": "",
        "inline": true
      },
      {
        "name": "",
        "value": ":one: -> 2:17.3",
        "inline": true
      },
      {
        "name": "",
        "value": "2200",
        "inline": true
      },
      {
        "name": "",
        "value": "120bpm",
        "inline": true
      },

      {
        "name": "",
        "value":":two: -> 2:15.5\n:three: -> 2:16.2"
      }

   ],
   "footer":{
      "text":"nice work!",
      "icon_url":"https://example.com/bot-icon.png"
   },
   "timestamp":"2025-09-18T23:54:34.853Z"
   }]
}'
