# Bitsacco Home

The standalone Next.js application for [bitsacco.com](https://bitsacco.com). It includes the public website, guides and blog content, contact endpoint, and embedded Sanity Studio.

## Requirements

- Node.js 24 LTS (24.20.0 or newer)
- npm 12
- Docker and Docker Compose for container deployment

## Local development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The application is available at <http://localhost:3000>. See [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md) for every supported environment variable.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=low
```

## Docker deployment

Copy `.env.example` to `.env`, set the production values, then build and start the hardened production container:

```bash
npm run docker:up
npm run docker:logs
```

The image runs as an unprivileged user. Application code and public assets are root-owned and the container root filesystem is read-only under Compose; only `/tmp` and the Next.js image cache are writable temporary filesystems.

To stop it:

```bash
npm run docker:down
```

The GitHub Actions publish workflow builds `Dockerfile` and publishes both `home:latest` and an immutable commit-SHA tag to Docker Hub on pushes to `main`.

## Project layout

```text
app/             Next.js routes and API handlers
components/      Website and local UI components
config/          Tailwind design tokens and preset
lib/             Shared application helpers
public/          Static assets
sanity/          CMS client, queries, schemas, and generated types
types/           Application type definitions
Dockerfile       Multi-stage production image
compose.yml      Hardened local/host deployment
```
