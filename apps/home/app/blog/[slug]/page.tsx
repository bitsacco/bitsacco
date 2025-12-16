import { Footer } from '@/components/footer'
import { HeroImage } from '@/components/hero-image'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { portableTextComponents } from '@/components/portable-text'
import { ProseContent } from '@/components/prose-content'
import { Heading } from '@/components/text'
import { image } from '@/sanity/image'
import { getPost } from '@/sanity/queries'
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
  const post = await getPost(params.slug)

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
      images: post.featuredImage
        ? [
            {
              url: image(post.featuredImage).width(1200).height(630).url(),
              width: 1200,
              height: 630,
              alt: post.featuredImage.alt ?? post.title ?? undefined,
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
      images: post.featuredImage
        ? [image(post.featuredImage).width(1200).height(630).url()]
        : undefined,
    },
  }
}

export default async function BlogPost(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const post = (await getPost(params.slug)) || notFound()

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <article className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <time className="text-sm font-medium text-gray-400">
                {dayjs(post.publishedAt).format('MMMM D, YYYY')}
              </time>
              <Heading as="h1" className="mt-4 text-white">
                {post.title}
              </Heading>
            </div>

            <div className="mb-12 flex flex-wrap items-center justify-center gap-6">
              {post.author && (
                <div className="flex items-center gap-3">
                  {post.author.image && (
                    <Image
                      alt=""
                      src={image(post.author.image).size(40, 40).url()}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover ring-1 ring-gray-600"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-300">
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
                {post.featuredImage && (
                  <div className="mb-12">
                    <HeroImage
                      alt={post.featuredImage.alt || ''}
                      src={image(post.featuredImage).size(1600, 900).url()}
                      width={1600}
                      height={900}
                      className="ring-gray-600"
                    />
                  </div>
                )}
                {post.body && (
                  <PortableText
                    value={post.body}
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
