# Naija Vibes — consent-based location sharing preview

A person must open their private link, actively agree, and grant browser location permission. A phone number alone cannot reveal GPS location.

## Run locally
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Free preview hosting
Use a Node web service with build command `npm install` and start command `npm start`.

## Limitations and safety
- This preview stores sessions in server memory. Restarts or sleep can erase them.
- Links expire after 24 hours.
- The sharing page must remain open while sharing.
- Only the latest coordinate is stored; no route history.
- Owner token is held in browser session storage; keep the dashboard browser private.
- Not production-ready: add durable storage, authentication, rate limiting, CSRF/origin protections, audit/deletion workflows, and privacy/legal review before real use.
- Use only with your own device or someone who explicitly agreed. Never use this to track someone secretly.