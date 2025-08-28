/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import { isSanityConfigured } from '@/sanity/env'
import config from '../../../../sanity.config'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Sanity Studio Not Configured</h1>
        <p>
          Please set NEXT_PUBLIC_SANITY_PROJECT_ID and
          NEXT_PUBLIC_SANITY_DATASET environment variables.
        </p>
      </div>
    )
  }
  return <NextStudio config={config} />
}
