FROM node:lts-bullseye-slim AS base

# Development stage with hot reload
FROM base AS development

# No need for additional compatibility layers with Debian

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/home/package.json ./apps/home/package.json
COPY packages/ ./packages/

# Install all dependencies including devDependencies at root level first
RUN npm ci || npm install

# Install app-specific dependencies including devDependencies
WORKDIR /app/apps/home
RUN npm install

# Don't run as root in development (but keep current user for volume mounts)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Skipping chown for development to speed up build
# RUN chown -R nextjs:nodejs /app
# USER nextjs  # Commented out for development to match host user

# Start development server with hot reload
CMD ["sh", "-c", "npm run dev"]

FROM base AS builder

WORKDIR /app
RUN npm install -g turbo

COPY . .

RUN turbo prune --scope="@bitsacco/home" --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /app

# Install turbo
RUN npm install -g turbo

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json* ./
RUN npm ci || npm install

# Build the project
COPY --from=builder /app/out/full/ .
# TODO: Remove this copy once https://github.com/vercel/turbo/issues/3758 is fixed
COPY ./turbo.json .

ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_SUPPORT_WHATSAPP
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET
ENV NEXT_PUBLIC_SUPPORT_WHATSAPP=$NEXT_PUBLIC_SUPPORT_WHATSAPP
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build with turbo to ensure dependencies are built first
RUN turbo run build --filter=@bitsacco/home

FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/home/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/home/.next/static ./apps/home/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/home/public ./apps/home/public

ENV NODE_ENV=production

CMD ["node", "apps/home/server.js"]
