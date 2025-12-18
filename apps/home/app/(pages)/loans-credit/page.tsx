import { SanityPage } from '@/components/sanity-page'
import { generatePageMetadata, getPageData } from '@/lib/page-utils'
import type { Metadata } from 'next'

const PAGE_CONFIG = {
  slug: 'loans-credit',
  fallbackTitle: 'Loans & Credit',
  fallbackDescription:
    'Access Bitcoin-backed loans and credit services through Bitsacco community-driven financial platform.',
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(PAGE_CONFIG)
}

export default async function LoansCreditPage() {
  const page = await getPageData(PAGE_CONFIG.slug)

  return (
    <SanityPage
      page={page}
      fallbackTitle={PAGE_CONFIG.fallbackTitle}
      fallbackDescription={PAGE_CONFIG.fallbackDescription}
    />
  )
}
