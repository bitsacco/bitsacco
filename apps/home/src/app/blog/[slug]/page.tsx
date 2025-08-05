import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { Heading, Subheading } from '@/components/text'
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
      <main className="min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Container className="py-24">
          <Subheading className="text-gray-300">
            {dayjs(post.publishedAt).format('dddd, MMMM D, YYYY')}
          </Subheading>
          <Heading as="h1" className="mt-2 text-white">
            {post.title}
          </Heading>
          <div className="mt-16 grid grid-cols-1 gap-8 pb-24 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_15rem]">
            <div className="flex flex-wrap items-center gap-8 max-lg:justify-between lg:flex-col lg:items-start">
              {post.author && (
                <div className="flex items-center gap-3">
                  {post.author.image && (
                    <img
                      alt=""
                      src={image(post.author.image).size(64, 64).url()}
                      className="aspect-square size-6 rounded-full object-cover"
                    />
                  )}
                  <div className="text-sm/5 text-gray-300">
                    {post.author.name}
                  </div>
                </div>
              )}
              {Array.isArray(post.categories) && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/blog?category=${category.slug}`}
                      className="rounded-full border border-dotted border-gray-600 bg-gray-800 px-2 text-sm/6 font-medium text-gray-400"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="text-gray-300">
              <div className="max-w-2xl xl:mx-auto">
                {post.mainImage && (
                  <img
                    alt={post.mainImage.alt || ''}
                    src={image(post.mainImage).size(2016, 1344).url()}
                    className="mb-10 aspect-3/2 w-full rounded-2xl object-cover shadow-xl"
                  />
                )}
                {post.body && (
                  <PortableText
                    value={post.body}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p className="my-10 text-base/8 first:mt-0 last:mb-0 dark:text-gray-300">
                            {children}
                          </p>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mt-12 mb-10 text-2xl/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0 dark:text-white">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mt-12 mb-10 text-xl/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0 dark:text-white">
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-10 border-l-2 border-l-gray-300 pl-6 text-base/8 text-gray-950 first:mt-0 last:mb-0 dark:border-l-gray-600 dark:text-gray-300">
                            {children}
                          </blockquote>
                        ),
                      },
                      types: {
                        image: ({ value }) => (
                          <img
                            alt={value.alt || ''}
                            src={image(value).width(2000).url()}
                            className="w-full rounded-2xl"
                          />
                        ),
                        separator: ({ value }) => {
                          switch (value.style) {
                            case 'line':
                              return (
                                <hr className="my-8 border-t border-gray-700" />
                              )
                            case 'space':
                              return <div className="my-8" />
                            default:
                              return null
                          }
                        },
                      },
                      list: {
                        bullet: ({ children }) => (
                          <ul className="list-disc pl-4 text-base/8 marker:text-gray-500">
                            {children}
                          </ul>
                        ),
                        number: ({ children }) => (
                          <ol className="list-decimal pl-4 text-base/8 marker:text-gray-500">
                            {children}
                          </ol>
                        ),
                      },
                      listItem: {
                        bullet: ({ children }) => {
                          return (
                            <li className="my-2 pl-2 has-[br]:mb-8 dark:text-gray-300">
                              {children}
                            </li>
                          )
                        },
                        number: ({ children }) => {
                          return (
                            <li className="my-2 pl-2 has-[br]:mb-8 dark:text-gray-300">
                              {children}
                            </li>
                          )
                        },
                      },
                      marks: {
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-950 dark:text-white">
                            {children}
                          </strong>
                        ),
                        code: ({ children }) => (
                          <>
                            <span aria-hidden>`</span>
                            <code className="text-[15px]/8 font-semibold text-white">
                              {children}
                            </code>
                            <span aria-hidden>`</span>
                          </>
                        ),
                        link: ({ value, children }) => {
                          return (
                            <Link
                              href={value.href}
                              className="font-medium text-teal-400 underline decoration-teal-400 underline-offset-4 data-hover:decoration-teal-300"
                            >
                              {children}
                            </Link>
                          )
                        },
                      },
                    }}
                  />
                )}
                <div className="mt-10">
                  <Button variant="outline" href="/blog">
                    <CaretLeftIcon className="size-4" />
                    Back to blog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
