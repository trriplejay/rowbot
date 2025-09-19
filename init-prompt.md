# discord-row-reporter

## description

this application listens for webhooks from the concept2 logbook api, and converts the results into a nicely formatted discord embed message, which it then sends to the configured discord webhook, which is provided to the application as an environmental configuration.

## implementation steps

1. using pure javascript and html (no frameworks) and using the Bun built-in serving library, create a simple webpage. This page should have a large "login" button in the center. For now, clickin the button does nothing
2. enhance the login button to redirect to the concept2 logbook oauth endpoint. Create a callback URL via Bun router that will handle the oauth response from concept2 logbook api. The logbook oauth connection information should be provided as environment values to the application. This needs to include a clientID and API key. You can find information on the implementation here: https://log.concept2.com/developers/documentation
3. As a response to the callback route, serve an HTML page that says "success" or "failure", and the resulting user access token and refresh token should be stored in an http-only secure cookie.
4. when the main page loads, if the secure cookie is present, change the login button to a "logout" button, which simply deletes the cookie and refreshes the main page.
5. creating a route for receiving webhooks from the concept2 logbook api. Upon receiving a webhook, the basic data of 'distance' and 'time' should be send as a discord embed message via discord.js to whatever discord webhook URL is provided in the environment.
