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

const KNOWN_PAGE_SLUG = 'about'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    return {
      title: 'About Bitsacco',
      description:
        'Community-first Bitcoin financial education and tools for Africa',
    }
  }

  return {
    title: `${page.title} - Bitsacco`,
    description:
      page.excerpt ||
      'Community-first Bitcoin financial education and tools for Africa',
  }
}

export default async function AboutPage() {
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
            <Heading className="text-white" as="h1">
              {page.title}
            </Heading>
            {page.excerpt && (
              <Lead className="mx-auto mt-8 max-w-2xl text-gray-300">
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

          <div className="mx-auto max-w-2xl text-center">
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
