import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { image } from '@/sanity/image'
import { getPage } from '@/sanity/queries'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { notFound } from 'next/navigation'

const KNOWN_PAGE_SLUG = 'about'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    return {
      title: 'About Bitsacco - Bitcoin-powered Financial Services for Africa',
      description:
        'We are a team of African builders creating the missing infrastructure for modern finance on the continent.',
    }
  }

  return {
    title: `${page.title} - Bitsacco`,
    description:
      page.excerpt ||
      'We are a team of African builders creating the missing infrastructure for modern finance on the continent.',
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
      <section className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-32">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h1 className="mb-6 text-center text-lg font-semibold tracking-wider text-teal-400">
                {page.title?.toUpperCase()}
              </h1>

              {page.publishedAt && (
                <p className="mb-8 text-sm text-gray-400">
                  Last updated:{' '}
                  {new Date(page.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}

              {page.mainImage && (
                <img
                  alt={page.mainImage.alt || page.title || ''}
                  src={image(page.mainImage).width(1200).height(600).url()}
                  className="mb-10 w-full rounded-lg object-cover shadow-lg"
                />
              )}

              <div className="space-y-6">
                {page.body && (
                  <PortableText
                    value={page.body}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p className="text-lg leading-relaxed text-gray-300">
                            {children}
                          </p>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-6 text-lg font-medium text-gray-900 dark:text-white">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mt-4 mb-2 text-lg font-medium text-gray-900 dark:text-white">
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-6 border-l-4 border-gray-300 pl-6 text-gray-700 italic dark:border-gray-600 dark:text-gray-300">
                            {children}
                          </blockquote>
                        ),
                      },
                      list: {
                        bullet: ({ children }) => (
                          <ul className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
                            {children}
                          </ul>
                        ),
                        number: ({ children }) => (
                          <ol className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
                            {children}
                          </ol>
                        ),
                      },
                      listItem: {
                        bullet: ({ children }) => (
                          <li className="flex items-center justify-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-teal-500" />
                            {children}
                          </li>
                        ),
                        number: ({ children }) => (
                          <li className="flex items-center justify-center gap-3">
                            {children}
                          </li>
                        ),
                      },
                      marks: {
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800">
                            {children}
                          </code>
                        ),
                        link: ({ value, children }) => (
                          <a
                            href={value?.href}
                            className="inline-flex items-center font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                            target={
                              value?.href?.startsWith('http')
                                ? '_blank'
                                : undefined
                            }
                            rel={
                              value?.href?.startsWith('http')
                                ? 'noopener noreferrer'
                                : undefined
                            }
                          >
                            {children}
                          </a>
                        ),
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </>
  )
}
