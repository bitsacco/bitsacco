import { SanityPage } from '@/components/sanity-page'
import { generatePageMetadata, getPageData } from '@/lib/page-utils'
import type { Metadata } from 'next'

const PAGE_CONFIG = {
  slug: 'media',
  fallbackTitle: 'Media Kit',
  fallbackDescription:
    'Download Bitsacco logos, brand assets, and media kit for press and marketing use.',
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(PAGE_CONFIG)
}

export default async function MediaKitPage() {
  const page = await getPageData(PAGE_CONFIG.slug)

  return (
    <SanityPage
      page={page}
      fallbackTitle={PAGE_CONFIG.fallbackTitle}
      fallbackDescription={PAGE_CONFIG.fallbackDescription}
    />
  )
}
