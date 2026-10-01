# Developer portfolio

A Vue 3 portfolio with an editorial dark theme, mint accents, layered glass surfaces, a spatial code hero, and responsive project, experience, services, and contact sections.

## Run locally

```sh
npm install
npm run dev
```

The development server serves the Vue app and the portfolio API together at `http://localhost:5173`.

## OmniRoute assistant

The portfolio guide uses the server-side `/api/assistant` endpoint. That endpoint forwards OpenAI-compatible chat requests to OmniRoute; its API key stays on the server and is never included in the browser bundle.

Start OmniRoute and connect at least one working model/provider. Copy `.env.example` to `.env`, then set the server-only `OMNIROUTE_API_KEY`. `OMNIROUTE_BASE_URL` defaults to `http://127.0.0.1:20128/v1` and `OMNIROUTE_MODEL` defaults to `auto`; set those values if your OmniRoute setup differs. Do not commit `.env`.

The assistant is hidden until the API reports that the OmniRoute settings are present. The API limits message size, conversation history, request time, and request frequency.

## API routes

- `GET /api/health` — server and assistant configuration status
- `GET /api/portfolio` — profile, principles, skills, automatically synced projects, experience, and services
- `POST /api/projects/refresh` — request a project sync (15-minute cooldown)
- `POST /api/assistant` — portfolio-grounded chat through OmniRoute

Profile, principles, skills, experience, and services live in `src/data/portfolio.js`. Projects are discovered from public GitHub repositories rather than maintained as a separate hand-written list.

## GitHub project sync

Set `GITHUB_USERNAME` in the server environment (defaults to `mikkat918`). The server discovers public, non-archived repositories owned by that account, follows GitHub pagination, and refreshes the project snapshot every 15 minutes by default. `GITHUB_CACHE_TTL_MS` controls that interval (minimum 60 seconds, maximum 24 hours). The last complete snapshot is persisted under `.cache/` and served if GitHub is temporarily unavailable. No token is needed for public repositories.

The portfolio repository is excluded by name; this account’s configuration repository is excluded by stable ID in `src/data/github-projects.js`. If you change `GITHUB_USERNAME`, update the account-specific excluded and featured IDs in that file too. It also controls archived repositories and forks, approved public external repositories, and per-repository overrides keyed by repository ID, `owner/name`, or name. Overrides can provide `title`, `description`, `status`, `liveUrl`, `previewImage`, and `featured`. Approved external repositories must be public; private repositories are never read. Forks are included by default (`includeForks: true`).

Preview selection uses an override image first, then a repository-root `portfolio-preview.png`, then safe GitHub-hosted README images, then a generated SVG fallback. Extra README images appear in the project gallery. Project cards use the repository description, README summary, detected primary language and topics, repository link, optional homepage, and timestamps. Status stays neutral unless explicitly overridden; the sync does not infer deployment or completion claims.

The app refresh button calls `POST /api/projects/refresh`, which has a 15-minute cooldown to protect GitHub API limits. GitHub request timeouts, stale-cache fallback, rate-limit handling, and background refresh are managed on the server.

## Production

```sh
npm run build
npm run start
```

The production server serves `dist/` and the same API routes. Configure `GITHUB_USERNAME`, `GITHUB_CACHE_TTL_MS`, and the OmniRoute environment variables in the hosting environment. Persist `.cache/` between restarts if your host supports writable persistent storage. Bind `PORT` to the port supplied by the host.
