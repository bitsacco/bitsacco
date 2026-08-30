export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-15'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || ''

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

export const isSanityConfigured = !!(dataset && projectId)
