import { SanityPage } from '@/components/sanity-page'
import { generatePageMetadata, getPageData } from '@/lib/page-utils'
import type { Metadata } from 'next'

const PAGE_CONFIG = {
  slug: 'open-source',
  fallbackTitle: 'Open Source',
  fallbackDescription:
    'Learn about Bitsacco open source initiatives and contributions to the Bitcoin ecosystem.',
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(PAGE_CONFIG)
}

export default async function OpenSourcePage() {
  const page = await getPageData(PAGE_CONFIG.slug)

  return (
    <SanityPage
      page={page}
      fallbackTitle={PAGE_CONFIG.fallbackTitle}
      fallbackDescription={PAGE_CONFIG.fallbackDescription}
    />
  )
}
