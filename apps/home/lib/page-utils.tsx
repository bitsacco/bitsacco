import { SanityPage } from '@/components/sanity-page'
import { getPage } from '@/sanity/queries'
import type { Metadata } from 'next'

export interface PageConfig {
  slug: string
  fallbackTitle: string
  fallbackDescription: string
  brandSuffix?: string
}

export async function generatePageMetadata({
  slug,
  fallbackTitle,
  fallbackDescription,
  brandSuffix = ' | Bitsacco',
}: PageConfig): Promise<Metadata> {
  const page = await getPage(slug)

  if (!page) {
    return {
      title: `${fallbackTitle}${brandSuffix}`,
      description: fallbackDescription,
    }
  }

  const description = page.excerpt || fallbackDescription

  return {
    title: `${page.title}${brandSuffix}`,
    description: description,
  }
}

export async function getPageData(slug: string) {
  return await getPage(slug)
}

export function createPage({
  slug,
  fallbackTitle,
  fallbackDescription,
}: Omit<PageConfig, 'brandSuffix'>) {
  const PAGE_CONFIG = {
    slug,
    fallbackTitle,
    fallbackDescription,
  }

  async function generateMetadata(): Promise<Metadata> {
    return generatePageMetadata(PAGE_CONFIG)
  }

  async function Page() {
    const page = await getPageData(PAGE_CONFIG.slug)

    return (
      <SanityPage
        page={page}
        fallbackTitle={PAGE_CONFIG.fallbackTitle}
        fallbackDescription={PAGE_CONFIG.fallbackDescription}
      />
    )
  }

  return { generateMetadata, Page }
}
