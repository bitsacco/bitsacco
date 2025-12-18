import { SanityPage } from '@/components/sanity-page'
import { generatePageMetadata, getPageData } from '@/lib/page-utils'
import type { Metadata } from 'next'

const PAGE_CONFIG = {
  slug: 'group-savings',
  fallbackTitle: 'Group Savings',
  fallbackDescription:
    'Save together with your community through Bitsacco group savings features and achieve financial goals collectively.',
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(PAGE_CONFIG)
}

export default async function GroupSavingsPage() {
  const page = await getPageData(PAGE_CONFIG.slug)

  return (
    <SanityPage
      page={page}
      fallbackTitle={PAGE_CONFIG.fallbackTitle}
      fallbackDescription={PAGE_CONFIG.fallbackDescription}
    />
  )
}
