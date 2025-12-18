import { SanityPage } from '@/components/sanity-page'
import { generatePageMetadata, getPageData } from '@/lib/page-utils'
import type { Metadata } from 'next'

const PAGE_CONFIG = {
  slug: 'mini-apps',
  fallbackTitle: 'Mini Apps',
  fallbackDescription:
    'Discover Bitsacco mini apps that integrate seamlessly with Bitcoin and Lightning payments.',
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(PAGE_CONFIG)
}

export default async function MiniAppsPage() {
  const page = await getPageData(PAGE_CONFIG.slug)

  return (
    <SanityPage
      page={page}
      fallbackTitle={PAGE_CONFIG.fallbackTitle}
      fallbackDescription={PAGE_CONFIG.fallbackDescription}
    />
  )
}
