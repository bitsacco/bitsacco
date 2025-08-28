import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { image } from '@/sanity/image'
import { getPage } from '@/sanity/queries'
import { type Metadata } from 'next'
import { PortableText } from 'next-sanity'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const KNOWN_PAGE_SLUG = 'privacy-policy'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    return {
      title: 'Privacy Policy - Bitsacco',
      description:
        'Learn how Bitsacco collects, uses, and protects your information.',
    }
  }

  return {
    title: `${page.title} - Bitsacco`,
    description:
      page.excerpt ||
      'Learn how Bitsacco collects, uses, and protects your information.',
  }
}

export default async function PrivacyPage() {
  const page = await getPage(KNOWN_PAGE_SLUG)

  if (!page) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <section className="py-16">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                {page.title}
              </h1>
              {page.publishedAt && (
                <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
                  Last updated:{' '}
                  {new Date(page.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}

              {page.mainImage && (
                <Image
                  alt={page.mainImage.alt || page.title || ''}
                  src={image(page.mainImage).width(1200).height(600).url()}
                  width={1200}
                  height={600}
                  className="mb-10 w-full rounded-lg object-cover shadow-lg"
                />
              )}

              <div className="prose prose-gray dark:prose-invert max-w-none">
                {page.body && (
                  <PortableText
                    value={page.body}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p className="mb-6 text-base leading-relaxed">
                            {children}
                          </p>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mt-8 mb-4 text-xl font-semibold">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mt-4 mb-2 text-lg font-medium">
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
                          <ul className="mb-4 list-disc pl-6">{children}</ul>
                        ),
                        number: ({ children }) => (
                          <ol className="mb-4 list-decimal pl-6">{children}</ol>
                        ),
                      },
                      listItem: {
                        bullet: ({ children }) => (
                          <li className="mb-2">{children}</li>
                        ),
                        number: ({ children }) => (
                          <li className="mb-2">{children}</li>
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
                            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
          </Container>
        </section>
        <Footer />
      </main>
    </>
  )
}
