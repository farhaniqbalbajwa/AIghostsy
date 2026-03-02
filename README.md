# AI Haunted Ghost

## Why it shows "disconnected" on GitHub Pages
GitHub Pages only hosts static files. It cannot run `server.js`, so `/api/ask` does not exist there.

## Local run
1. Copy `.env.example` to `.env` (or export env vars manually).
2. Set `OPENAI_API_KEY`.
3. Run:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000`.

## GitHub Pages setup (frontend + external backend)
1. Deploy `server.js` to a backend host (Render/Railway/Fly/Cloud Run/etc.) and set `OPENAI_API_KEY` there.
2. Ensure backend allows cross-origin requests from your Pages site.
3. In this repo, edit `config.js`:
   ```js
   window.GHOST_API_BASE = "https://your-backend.example.com";
   ```
4. Publish to GitHub Pages.

The frontend will call `${GHOST_API_BASE}/api/ask` when hosted on `github.io`.
