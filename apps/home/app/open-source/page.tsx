import { Footer } from '@/components/footer'
import { HeroImage } from '@/components/hero-image'
import { Navbar } from '@/components/navbar'
import { portableTextComponents } from '@/components/portable-text'
import { ProseContent } from '@/components/prose-content'
import { Heading, Lead } from '@/components/text'
import { image } from '@/sanity/image'
import { getPage } from '@/sanity/queries'
import { Container } from '@bitsacco/ui'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { notFound } from 'next/navigation'

const KNOWN_PAGE_SLUG = 'open-source'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    return {
      title: 'Open Source | Bitsacco',
      description:
        "Learn about Bitsacco's open source initiatives and contributions to the Bitcoin ecosystem.",
    }
  }

  return {
    title: `${page.title}`,
    description:
      page.excerpt ||
      "Learn about Bitsacco's open source initiatives and contributions to the Bitcoin ecosystem.",
  }
}

export default async function OpenSourcePage() {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <div className="mb-16 text-center">
            <Heading className="text-neutral-950 dark:text-neutral-0" as="h1">
              {page.title}
            </Heading>
            {page.excerpt && (
              <Lead className="mx-auto mt-8 max-w-2xl text-neutral-600 dark:text-neutral-400">
                {page.excerpt}
              </Lead>
            )}
          </div>

          {page.mainImage && (
            <div className="mx-auto mb-12 max-w-4xl">
              <HeroImage
                alt={page.mainImage.alt || page.title || ''}
                src={image(page.mainImage).width(1200).height(600).url()}
                width={1200}
                height={600}
              />
            </div>
          )}

          <div className="mx-auto max-w-2xl">
            <ProseContent>
              {page.body && (
                <PortableText
                  value={page.body}
                  components={portableTextComponents}
                />
              )}
            </ProseContent>
          </div>
        </Container>
        <Footer />
      </main>
    </>
  )
}
