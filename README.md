# mentor-mentee-app

Web app. React 19, TypeScript, Vite, Redux Toolkit, Tailwind. Port `8080`.

Calls the gateway at `http://localhost:8765` (`src/service/request/api.ts`). Start the gateway, auth and core first. See the workspace [README](../README.md).

Design rules: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Coding standards: [AGENTS.md](AGENTS.md).

## Requirements

- Node.js 22 and npm

## Install

```bash
npm ci
```

## Run locally

Dev server with hot reload on http://localhost:8080:

```bash
npm run dev
```

Production build into `dist/`, then serve it on the same port:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Docker

`.docker/` holds a two-stage Dockerfile (Node build, nginx serve) and a compose file. It serves the production build on http://localhost:8080.

```bash
docker compose -f .docker/docker-compose.yml up -d --build
```

Stop it:

```bash
docker compose -f .docker/docker-compose.yml down
```

The browser still calls the gateway at `http://localhost:8765`, so start the backend too.

Port 8080 must stay free for both the dev server and the container (`strictPort`). The gateway allows CORS only from `http://localhost:8080` by default. Change `CORS_ALLOWED_ORIGINS` in `../.env` to use another origin.
