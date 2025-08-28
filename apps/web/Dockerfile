FROM node:lts-bullseye-slim AS base

# Development stage with hot reload
FROM base AS development

# No need for additional compatibility layers with Debian

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/

# Install all dependencies including devDependencies at root level first
RUN npm ci || npm install

# Install app-specific dependencies including devDependencies
WORKDIR /app/apps/web
RUN npm install

# Don't run as root in development (but keep current user for volume mounts)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Skipping chown for development to speed up build
# RUN chown -R nextjs:nodejs /app
# USER nextjs  # Commented out for development to match host user

# Create .next directory with proper permissions for anonymous volume
RUN mkdir -p /app/apps/web/.next && chmod 777 /app/apps/web/.next

# Start development server with hot reload
CMD ["sh", "-c", "npm run dev"]

FROM base AS builder

WORKDIR /app
RUN npm install -g turbo

COPY . .

RUN turbo prune --scope="@bitsacco/web" --docker

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

ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG API_URL
ARG NEXT_PUBLIC_SUPPORT_WHATSAPP
ARG NEXT_PUBLIC_SUPPORT_EMAIL

ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_SUPPORT_WHATSAPP=$NEXT_PUBLIC_SUPPORT_WHATSAPP
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL

# Build with turbo to ensure dependencies are built first
RUN turbo run build --filter=@bitsacco/web

FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production

CMD ["node", "apps/web/server.js"]
