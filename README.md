# Bitsacco Web Monorepo

Financial tools for communities - A modern monorepo containing the Bitsacco web applications and shared packages.

## 🏗️ Monorepo Structure

```
bitsacco/web/
├── apps/
│   ├── home/              # Main website with Sanity CMS integration
│   └── mobile/            # React Native mobile app with Expo
├── packages/
│   ├── core/              # Shared business logic and utilities
│   ├── ui/                # Shared UI components
│   ├── eslint-config/     # Shared ESLint configurations
│   ├── tsconf/           # Shared TypeScript configurations
│   └── tailwind-config/  # Shared Tailwind CSS configuration
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
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) for mobile development
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
npm run dev      # Runs all apps (mobile, home)
npm run dev:all  # Alias for npm run dev

# Run specific applications
npm run dev:home   # Home website (localhost:3000)
npm run dev:mobile # Mobile app (Expo dev server)

# Platform-specific mobile development
npm run dev:mobile:ios     # Launch on iOS simulator
npm run dev:mobile:android # Launch on Android emulator
npm run dev:mobile:web     # Launch mobile app in browser

# Full-stack development (mobile only)
npm run dev:fullstack # Runs mobile app

# Using Docker Compose for backend services
npm start        # Start all services
npm stop         # Stop all services
npm run logs     # View logs
```

## 📦 Available Scripts

### Development Commands

- `npm run dev` - Run all apps in development mode
- `npm run dev:all` - Alias for npm run dev
- `npm run dev:home` - Run home website only (port 3000)
- `npm run dev:mobile` - Run mobile app with Expo dev server
- `npm run dev:mobile:ios` - Launch mobile app on iOS simulator
- `npm run dev:mobile:android` - Launch mobile app on Android emulator
- `npm run dev:mobile:web` - Launch mobile app in browser
- `npm run dev:fullstack` - Run mobile app

### Build Commands

- `npm run build` - Build all apps
- `npm run build:home` - Build home website only
- `npm run build:mobile` - Build mobile app only
- `npm run build:ui` - Build UI package only
- `npm run build:core` - Build core package only

### Quality Commands

- `npm run lint` - Lint all apps
- `npm run lint:fix` - Lint and fix all apps
- `npm run typecheck` - Type check all apps
- `npm run test` - Run tests across all apps
- `npm run format` - Format code with Prettier

### Utility Commands

- `npm run clean` - Clean build outputs
- `npm run clean:docker` - Clean Docker volumes and containers

### Docker Commands

- `npm start` - Start all services with Docker Compose
- `npm stop` - Stop all Docker services
- `npm run logs` - View logs for all services
- `npm run dc <command>` - Run any docker-compose command

## 🏢 Applications

### Mobile App (`apps/mobile`)

React Native mobile application built with Expo for iOS and Android.

**Features:**

- Cross-platform mobile development with React Native
- Expo development server for fast iteration
- Redux Toolkit for state management
- React Navigation for routing
- TypeScript support
- Shared components with web applications

**Tech Stack:**

- React Native 0.79.6
- Expo SDK 53
- React 19
- Redux Toolkit
- React Navigation
- TypeScript

**Development:**

```bash
# Start mobile development server
npm run dev:mobile

# Launch on specific platforms
npm run dev:mobile:ios     # iOS Simulator
npm run dev:mobile:android # Android Emulator
npm run dev:mobile:web     # Web browser
```

**Access:**
- Expo DevTools: http://localhost:19002
- Metro Bundler: http://localhost:8081

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
