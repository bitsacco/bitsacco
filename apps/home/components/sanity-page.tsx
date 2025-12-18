import { Footer } from '@/components/footer'
import { HeroImage } from '@/components/hero-image'
import { Navbar } from '@/components/navbar'
import { portableTextComponents } from '@/components/portable-text'
import { ProseContent } from '@/components/prose-content'
import { Heading, Lead } from '@/components/text'
import { image } from '@/sanity/image'
import { Container } from '@bitsacco/ui'
import { PortableText } from 'next-sanity'

interface SanityPageData {
  title?: string
  excerpt?: string
  featuredImage?: {
    alt?: string
    asset: any
  }
  mainImage?: {
    alt?: string
    asset: any
  }
  body?: any[]
}

interface SanityPageProps {
  page?: SanityPageData | null
  fallbackTitle: string
  fallbackDescription: string
}

export function SanityPage({
  page,
  fallbackTitle,
  fallbackDescription,
}: SanityPageProps) {
  const title = page?.title || fallbackTitle
  const description = page?.excerpt || fallbackDescription
  const featuredImage = page?.featuredImage || page?.mainImage

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <div className="mb-16 text-center">
            <Heading className="text-white" as="h1">
              {title}
            </Heading>
            <Lead className="mx-auto mt-8 max-w-2xl text-gray-300">
              {description}
            </Lead>
          </div>

          {featuredImage && (
            <div className="mx-auto mb-12 max-w-4xl">
              <HeroImage
                alt={featuredImage.alt || title || ''}
                src={image(featuredImage).width(1200).height(600).url()}
                width={1200}
                height={600}
              />
            </div>
          )}

          <div className="mx-auto max-w-2xl">
            <ProseContent>
              {page?.body && (
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
