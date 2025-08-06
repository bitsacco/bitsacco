import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { HeroImage } from '@/components/hero-image'
import { Navbar } from '@/components/navbar'
import { portableTextComponents } from '@/components/portable-text'
import { ProseContent } from '@/components/prose-content'
import { Heading, Lead } from '@/components/text'
import { image } from '@/sanity/image'
import { getPage } from '@/sanity/queries'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { notFound } from 'next/navigation'

const KNOWN_PAGE_SLUG = 'partners'
const PARTNERS_FORM_URL = process.env.NEXT_PUBLIC_PARTNERS_FORM_URL || ''

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    return {
      title: 'Partners - Bitsacco',
      description:
        'Partner with Bitsacco to bring Bitcoin-powered financial services to communities across Africa.',
    }
  }

  return {
    title: `${page.title} - Bitsacco`,
    description:
      page.excerpt ||
      'Partner with Bitsacco to bring Bitcoin-powered financial services to communities across Africa.',
  }
}

export default async function PartnersPage() {
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
            <Heading className="dark:text-neutral-0 text-neutral-950" as="h1">
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

          {/* Call to Action Section */}
          <section className="mt-20 rounded-2xl bg-gray-900 px-8 py-12 text-center sm:px-12 lg:px-16 dark:bg-gray-800">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Partner with Us?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-300">
                Join us in building the future of community-driven finance in
                Africa. Let's create lasting impact together.
              </p>
              {PARTNERS_FORM_URL && (
                <div className="mt-8">
                  <Button
                    href={PARTNERS_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-teal-400 hover:shadow-md"
                  >
                    Become a Partner
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </section>
        </Container>
        <Footer />
      </main>
    </>
  )
}
