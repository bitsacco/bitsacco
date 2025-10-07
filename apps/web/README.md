# Bitsacco Web App

## Quick Start

### Prerequisites

- Node.js v20+
- npm v7+
- Docker & Docker Compose

### Setup

```bash
# Clone and install
git clone https://github.com/bitsacco/bitsacco.git
cd bitsacco
npm install

# Configure environment
cd apps/web
cp .env.example .env.local
```

### Run Development Server

```bash
npm start web              # From repo root
# OR
npm run dev                # From apps/web directory

# With local backend API (advanced)
npm start nestapi web      # From repo root (requires .env configuration)

# Alternative: Run all services
npm start                  # From repo root
```

Access the app at http://localhost:3001

## Project Structure

```
apps/web/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
├── contexts/        # React contexts
└── public/          # Static assets
```

## Development

### Available Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Lint code
npm run typecheck    # TypeScript type checking
```

### Contributing

1. Create a branch: `git checkout -b yourusername/feature-name`
2. Make your changes
3. Test: `npm run lint && npm run typecheck && npm run build`
4. Commit: `git commit -m "feat: description"` (use [Conventional Commits](https://www.conventionalcommits.org/))
5. Push and create a PR

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for full guidelines.

## Environment Variables

Copy `.env.example` to `.env.local` to get started:

```bash
cp .env.example .env.local
```

Key variables:

- `NEXTAUTH_SECRET` - Authentication secret (required)
- `API_URL` - Backend API URL
  - Default: `https://api.staging.bitsacco.com/v1` (staging API - works out of the box)
  - Local: `http://nestapi:4000/v1` (requires running `npm start nestapi web` from repo root)

See `.env.example` for all available configuration options.

## Support

- [Discord](https://discord.gg/BMDK5rAu)
- [Twitter](https://x.com/bitsacco)
