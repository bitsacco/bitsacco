# Environment Configuration Guide

This document describes all environment variables used in the Bitsacco web application.

## Environment Variables

### Server Configuration

- **PORT** (default: `3000`)
  - The port number on which the Next.js application will run
  - Example: `PORT=3000`

### Sanity CMS Configuration

- **NEXT_PUBLIC_SANITY_PROJECT_ID** (required)
  - Your Sanity project ID
  - Obtain from: https://sanity.io/manage
  - Example: `NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"`

- **NEXT_PUBLIC_SANITY_DATASET** (default: `production`)
  - The Sanity dataset to use
  - Common values: `production`, `development`
  - Example: `NEXT_PUBLIC_SANITY_DATASET="production"`

- **NEXT_PUBLIC_SANITY_API_VERSION** (default: `2025-03-15`)
  - The Sanity API version to use
  - Format: YYYY-MM-DD
  - Example: `NEXT_PUBLIC_SANITY_API_VERSION="2025-03-15"`

### Email Service Configuration (Resend)

- **RESEND_API_KEY** (required for contact form)
  - API key for Resend email service
  - Obtain from: https://resend.com/api-keys
  - Example: `RESEND_API_KEY="re_123456789"`

- **SUPPORT_EMAIL** (default: `support@bitsacco.com`)
  - Email address where contact form submissions are sent
  - Example: `SUPPORT_EMAIL="support@bitsacco.com"`

### Public Contact Information

- **NEXT_PUBLIC_SUPPORT_WHATSAPP** (default: `+254708420214`)
  - WhatsApp number displayed for support
  - Include country code
  - Example: `NEXT_PUBLIC_SUPPORT_WHATSAPP="+254708420214"`

- **NEXT_PUBLIC_SUPPORT_EMAIL** (default: `support@bitsacco.com`)
  - Public support email displayed in the UI
  - Example: `NEXT_PUBLIC_SUPPORT_EMAIL="support@bitsacco.com"`

### Application URLs

- **NEXT_PUBLIC_APP_URL**
  - URL to the main Bitsacco application
  - Used for "Login" and "Get Started" links
  - Example: `NEXT_PUBLIC_APP_URL="https://app.example.com"`

- **API_URL** (required for .well-known proxy)
  - Backend API URL for proxying .well-known requests
  - Used for OpenID Connect, OAuth, and other well-known endpoints
  - Example: `API_URL="https://api.example.com"`

### Development Environment

- **NODE_ENV** (default: `development`)
  - Current environment mode
  - Values: `development`, `production`, `test`
  - Automatically set by Next.js
  - Example: `NODE_ENV="production"`

## Setup Instructions

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values in `.env.local`

3. Never commit `.env.local` to version control

## Environment Variable Prefixes

- **NEXT*PUBLIC***: Variables with this prefix are exposed to the browser
- Variables without this prefix are only available server-side

## Required vs Optional

### Required for basic functionality:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` (for CMS content)
- `RESEND_API_KEY` (for contact form)
- `API_URL` (for .well-known proxy)

### Optional with defaults:

- All other variables have sensible defaults but can be customized

## Security Notes

- Keep sensitive keys like `RESEND_API_KEY` and `API_URL` server-side only
- Use `NEXT_PUBLIC_` prefix only for non-sensitive configuration
- Never expose API keys or secrets to the client-side
