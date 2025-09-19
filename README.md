# TikTok Rewards — Demo website

## What this is
A demo website where users can watch TikTok videos and submit proof of actions (watched / liked / commented / shared). Each accepted action credits the user $0.50. Admins can review and approve actions, and export balances for payout.

**Important**: This demo does not automatically verify TikTok actions because TikTok requires OAuth/API. For production verification you must integrate TikTok's official API & OAuth.

## Quick local run (dev)
1. Install Node.js 18+ and MongoDB.
2. Server:
   - `cd server`
   - `npm install`
   - create `.env` or set env vars: `JWT_SECRET`, `MONGO_URI`, `ADMIN_EMAIL`, `PORT`.
   - `npm run dev` (or `npm start`)
3. Client:
   - Serve `client` folder with any static server (or open `client/index.html` directly).
   - Update `client/app.js` API base to your server host if not `localhost:4000`.

## Deploy to GitHub
- Push the repository to GitHub.
- Use Heroku / Render / Railway for the server; set env vars on the host.
- Use MongoDB Atlas for production DB.
- Secure uploads: consider S3 and virus scanning.

## Anti-fraud tips
- Require proof (link / screenshot).
- Rate-limit actions per user and per video.
- Admin review for suspicious items before payout.
- Integrate TikTok OAuth to auto-verify likes/comments when possible.

## License
MIT — this is sample/demo code.
