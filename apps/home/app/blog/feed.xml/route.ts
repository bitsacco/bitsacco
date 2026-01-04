import { image } from '@/sanity/image'
import { getBlogsForFeed } from '@/sanity/queries'
import { Feed } from 'feed'
import assert from 'node:assert'

export async function GET(req: Request) {
  const siteUrl = new URL(req.url).origin

  const feed = new Feed({
    title: 'Bitsacco Blog',
    description: 'Bitsacco Blog',
    author: {
      name: 'Bitsacco',
      email: 'admin@bitsacco.com',
    },
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  })

  const blogs = await getBlogsForFeed()

  if (!blogs) {
    return new Response(feed.rss2(), {
      headers: {
        'content-type': 'application/rss+xml; charset=utf-8',
      },
    })
  }

  blogs.forEach((blog) => {
    try {
      assert(typeof blog.title === 'string')
      assert(typeof blog.slug === 'string')
      assert(typeof blog.excerpt === 'string')
      assert(typeof blog.publishedAt === 'string')
    } catch {
      console.log('Blog is missing required fields for RSS feed:', blog)
      return
    }

    feed.addItem({
      title: blog.title,
      id: blog.slug,
      link: `${siteUrl}/blog/${blog.slug}`,
      content: blog.subtitle || blog.excerpt,
      image: blog.featuredImage
        ? image(blog.featuredImage)
            .size(1200, 800)
            .format('jpg')
            .url()
            .replaceAll('&', '&amp;')
        : undefined,
      author: blog.author?.name ? [{ name: blog.author.name }] : [],
      contributor: blog.author?.name ? [{ name: blog.author.name }] : [],
      date: new Date(blog.publishedAt),
    })
  })

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  })
}
