# Bitsacco Web Monorepo

Financial tools for communities - A modern monorepo containing the Bitsacco web applications and shared packages.

## 🏗️ Monorepo Structure

```
bitsacco/web/
├── apps/
│   └── home/              # Main website with Sanity CMS integration
├── packages/
│   ├── eslint/           # Shared ESLint configurations
│   ├── tsconf/           # Shared TypeScript configurations
│   └── types/            # Shared TypeScript type definitions
├── compose.yml           # Docker compose configuration
├── turbo.json           # Turborepo configuration
└── package.json         # Root package configuration
```

## 🚀 Quick Start

This project uses:

- [npm](https://docs.npmjs.com/) (v10.9.2+) for package management
- [Node.js](https://nodejs.org/) (v20.0.0+) runtime
- [Docker and Docker Compose](https://docs.docker.com/get-started/get-docker/) for containerized services
- [Turbo](https://turborepo.org/) for monorepo management
- [Next.js](https://nextjs.org/) for web application development
- [Sanity](https://www.sanity.io/) for content management

### Prerequisites

1. Install Node.js v20.0.0 or higher
2. Install Docker and Docker Compose
3. Clone the repository

### Installation

```bash
# Install all dependencies
npm install

# Copy environment variables
cd apps/home
cp .env.example .env.local
# Fill in required environment variables (see ENV_CONFIGURATION.md)
cd ../..
```

### Development

```bash
# Run all applications in development mode
npm run dev

# Run specific application
npm run dev:web  # Runs the home website

# Using Docker Compose
npm start        # Start all services
npm stop         # Stop all services
npm run logs     # View logs
```

## 📦 Available Scripts

### Root Level Commands

- `npm run dev` - Run all apps in development mode
- `npm run dev:web` - Run only the home website
- `npm run build` - Build all apps
- `npm run build:web` - Build only the home website
- `npm run lint` - Lint all apps
- `npm run test` - Run tests across all apps
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build outputs
- `npm run clean:docker` - Clean Docker volumes and containers

### Docker Commands

- `npm start` - Start all services with Docker Compose
- `npm stop` - Stop all Docker services
- `npm run logs` - View logs for all services
- `npm run dc <command>` - Run any docker-compose command

## 🏢 Applications

### Home Website (`apps/home`)

The main Bitsacco website built with Next.js 15 and Sanity CMS.

**Features:**

- Server-side rendering with Next.js App Router
- Content management with Sanity Studio
- Blog with RSS feed generation
- Contact form with rate limiting
- Dark/light theme support
- Partners carousel
- FAQ section
- `.well-known` proxy for OAuth/OIDC endpoints

**Tech Stack:**

- Next.js 15.3.3
- React 19
- Tailwind CSS v4
- Sanity CMS
- Resend for emails
- TypeScript

**Development:**

```bash
cd apps/home
npm run dev
```

**Access:**

- Website: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio

## 📚 Shared Packages

### `@bitsacco/core`

Shared business logic, utils and typescript type definitions across all apps

### `@bitsacco/tsconf`

Shared TypeScript configurations:

- `base.json` - Base configuration
- `nextjs.json` - Next.js apps
- `react-app.json` - React applications
- `react-library.json` - React component libraries
- `ts-library.json` - TypeScript libraries

## 🔧 Configuration

### Environment Variables

See [`apps/home/ENV_CONFIGURATION.md`](apps/home/ENV_CONFIGURATION.md) for detailed environment variable documentation.

Quick setup:

```bash
cd apps/home
cp .env.example .env.local
# Edit .env.local with your values
```

### Turbo Configuration

The monorepo uses Turborepo for efficient builds and caching. Configuration is in `turbo.json`.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific app
cd apps/home
npm run test
```

## 🎨 Code Style

This project uses:

- ESLint for linting
- Prettier for code formatting
- TypeScript for type safety

```bash
# Lint all code
npm run lint

# Format all code
npm run format
```

## 🐳 Docker Support

The project includes Docker configuration for containerized development:

```bash
# Start services
npm start

# View logs
npm run logs

# Stop services
npm stop

# Clean up
npm run clean:docker
```

## 🤝 Contributing

### Guidelines

1. **Create an issue first** and assign it to yourself
2. **Branch naming**: Use `username/feature-name` format
3. **Create a PR** - Never push directly to `main`
4. **Request review** from `@okjodom`
5. **Commit format**: Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Commit Examples

```bash
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
chore: upgrade dependencies
```

### Development Workflow

1. **Setup your environment**

   ```bash
   npm install
   cd apps/home
   cp .env.example .env.local
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b username/feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Add tests where applicable
   - Update documentation

4. **Test your changes**

   ```bash
   npm run lint
   npm run test
   npm run build
   ```

5. **Submit a PR**
   - Clear description of changes
   - Link to related issue
   - Screenshots for UI changes

## 📞 Support

If you have issues with this setup, reach out to **Jodom**:

- [Discord](https://discord.gg/2SJPpGFG)
- [Twitter](https://twitter.com/okjodom)
- [Email](mailto:okjodom@gmail.com)

## 📄 License

Copyright © 2025 Bitsacco. All rights reserved.
