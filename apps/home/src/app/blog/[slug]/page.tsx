import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { Heading } from '@/components/text'
import { image } from '@/sanity/image'
import { getPost } from '@/sanity/queries'
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  let post = await getPost(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title ?? undefined,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title ?? undefined,
      description: post.excerpt ?? undefined,
      url: `/blog/${params.slug ?? undefined}`,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author ? [`${post.author.name}`] : undefined,
      tags:
        post.categories
          ?.map((category) => category.title ?? '')
          .filter(Boolean) || undefined,
      images: post.mainImage
        ? [
            {
              url: image(post.mainImage).width(1200).height(630).url(),
              width: 1200,
              height: 630,
              alt: post.mainImage.alt ?? post.title ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title ?? undefined,
      description: post.excerpt ?? undefined,
      site: '@bitsacco',
      creator: '@bitsacco',
      images: post.mainImage
        ? [image(post.mainImage).width(1200).height(630).url()]
        : undefined,
    },
  }
}

export default async function BlogPost(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  let post = (await getPost(params.slug)) || notFound()

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <article className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <time className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {dayjs(post.publishedAt).format('MMMM D, YYYY')}
              </time>
              <Heading
                as="h1"
                className="dark:text-neutral-0 mt-4 text-neutral-950"
              >
                {post.title}
              </Heading>
            </div>

            <div className="mb-12 flex flex-wrap items-center justify-center gap-6">
              {post.author && (
                <div className="flex items-center gap-3">
                  {post.author.image && (
                    <img
                      alt=""
                      src={image(post.author.image).size(40, 40).url()}
                      className="size-10 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                    />
                  )}
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {post.author.name}
                  </span>
                </div>
              )}
              {Array.isArray(post.categories) && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/blog?category=${category.slug}`}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="prose prose-neutral prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-neutral-950 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 prose-strong:font-medium prose-strong:text-neutral-950 prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium prose-pre:rounded-lg prose-pre:border prose-pre:border-neutral-200 prose-pre:bg-neutral-50 prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-neutral-700 prose-blockquote:border-l-2 prose-blockquote:border-neutral-300 prose-blockquote:pl-6 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-neutral-600 prose-img:rounded-xl prose-img:shadow-sm prose-img:ring-1 prose-img:ring-neutral-200 dark:prose-headings:text-neutral-0 dark:prose-p:text-neutral-300 dark:prose-a:text-orange-400 hover:dark:prose-a:text-orange-300 dark:prose-strong:text-neutral-0 dark:prose-code:bg-neutral-800 dark:prose-code:text-neutral-200 dark:prose-pre:border-neutral-700 dark:prose-pre:bg-neutral-800 dark:prose-li:text-neutral-300 dark:prose-blockquote:border-neutral-600 dark:prose-blockquote:text-neutral-400 dark:prose-img:ring-neutral-700 mx-auto max-w-none">
              <div className="max-w-2xl xl:mx-auto">
                {post.mainImage && (
                  <img
                    alt={post.mainImage.alt || ''}
                    src={image(post.mainImage).size(1600, 900).url()}
                    className="mb-12 w-full rounded-xl object-cover shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                  />
                )}
                {post.body && (
                  <PortableText
                    value={post.body}
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
                <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                  <Button variant="outline" href="/blog">
                    <CaretLeftIcon className="size-4" />
                    Back to blog
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  )
}
