import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'
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
      title: 'About Bitsacco',
      description: 'We are a Savings and Credit Cooperative built on Bitcoin',
    }
  }

  return {
    title: `${page.title} - Bitsacco`,
    description:
      page.excerpt ||
      'We are a Savings and Credit Cooperative built on Bitcoin',
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
              <img
                alt={page.mainImage.alt || page.title || ''}
                src={image(page.mainImage).width(1200).height(600).url()}
                className="w-full rounded-xl object-cover shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800"
              />
            </div>
          )}

          <div className="mx-auto max-w-2xl text-center">
            <div className="prose prose-neutral prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-neutral-950 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 prose-strong:font-medium prose-strong:text-neutral-950 prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium prose-pre:rounded-lg prose-pre:border prose-pre:border-neutral-200 prose-pre:bg-neutral-50 prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-neutral-700 prose-blockquote:border-l-2 prose-blockquote:border-neutral-300 prose-blockquote:pl-6 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-neutral-600 dark:prose-headings:text-neutral-0 dark:prose-p:text-neutral-300 dark:prose-a:text-orange-400 hover:dark:prose-a:text-orange-300 dark:prose-strong:text-neutral-0 dark:prose-code:bg-neutral-800 dark:prose-code:text-neutral-200 dark:prose-pre:border-neutral-700 dark:prose-pre:bg-neutral-800 dark:prose-li:text-neutral-300 dark:prose-blockquote:border-neutral-600 dark:prose-blockquote:text-neutral-400 mx-auto">
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
        <Footer />
      </main>
    </>
  )
}
