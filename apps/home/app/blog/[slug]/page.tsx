import { Footer } from '@/components/footer'
import { HeroImage } from '@/components/hero-image'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { portableTextComponents } from '@/components/portable-text'
import { ProseContent } from '@/components/prose-content'
import { Heading } from '@/components/text'
import { image } from '@/sanity/image'
import { getBlog } from '@/sanity/queries'
import { Button, Container } from '@bitsacco/ui'
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  const blog = await getBlog(params.slug)

  if (!blog) {
    return {}
  }

  const description = blog.subtitle || blog.excerpt

  return {
    title: blog.title ?? undefined,
    description: description ?? undefined,
    openGraph: {
      title: blog.title ?? undefined,
      description: description ?? undefined,
      url: `/blog/${params.slug ?? undefined}`,
      type: 'article',
      publishedTime: blog.publishedAt ?? undefined,
      authors: blog.author ? [`${blog.author.name}`] : undefined,
      tags:
        blog.categories
          ?.map((category) => category.title ?? '')
          .filter(Boolean) || undefined,
      images: blog.featuredImage
        ? [
            {
              url: image(blog.featuredImage).width(1200).height(630).url(),
              width: 1200,
              height: 630,
              alt: blog.featuredImage.alt ?? blog.title ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title ?? undefined,
      description: description ?? undefined,
      site: '@bitsacco',
      creator: '@bitsacco',
      images: blog.featuredImage
        ? [image(blog.featuredImage).width(1200).height(630).url()]
        : undefined,
    },
  }
}

export default async function BlogPost(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const blog = (await getBlog(params.slug)) || notFound()

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <article className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <time className="text-sm font-medium text-gray-400">
                {dayjs(blog.publishedAt).format('MMMM D, YYYY')}
              </time>
              <Heading as="h1" className="mt-4 text-white">
                {blog.title}
              </Heading>
              {blog.subtitle && (
                <p className="mt-4 text-xl italic text-gray-400">
                  {blog.subtitle}
                </p>
              )}
            </div>

            <div className="mb-12 flex flex-wrap items-center justify-center gap-6">
              {blog.author && (
                <div className="flex items-center gap-3">
                  {blog.author.image && (
                    <Image
                      alt=""
                      src={image(blog.author.image).size(40, 40).url()}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover ring-1 ring-gray-600"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-300">
                    {blog.author.name}
                  </span>
                </div>
              )}
              {Array.isArray(blog.categories) && blog.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/blog?category=${category.slug}`}
                      className="rounded-full border border-gray-600 bg-gray-700 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-gray-600"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <ProseContent className="prose-img:rounded-xl prose-img:shadow-sm prose-img:ring-1 prose-img:ring-gray-600 max-w-none">
              <div className="max-w-2xl xl:mx-auto">
                {blog.featuredImage && (
                  <div className="mb-12">
                    <HeroImage
                      alt={blog.featuredImage.alt || ''}
                      src={image(blog.featuredImage).size(1600, 900).url()}
                      width={1600}
                      height={900}
                      className="ring-gray-600"
                    />
                  </div>
                )}
                {blog.body && (
                  <PortableText
                    value={blog.body}
                    components={portableTextComponents}
                  />
                )}
                <div className="mt-12 border-t border-gray-700 pt-8">
                  <Button variant="outline" href="/blog">
                    <CaretLeftIcon className="size-4" />
                    Back to blog
                  </Button>
                </div>
              </div>
            </ProseContent>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  )
}
