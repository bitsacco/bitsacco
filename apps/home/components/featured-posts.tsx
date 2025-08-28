import { Link } from '@/components/link'
import { Heading, Subheading } from '@/components/text'
import { getFeaturedPosts } from '@/sanity/queries'
import { Container } from '@bitsacco/ui'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr'
import dayjs from 'dayjs'

export async function FeaturedBlog() {
  const featuredPosts = await getFeaturedPosts(3)

  if (!featuredPosts || featuredPosts.length === 0) {
    return null
  }

  return (
    <section className="py-32 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Subheading className="mb-8 text-lg font-semibold tracking-wider text-teal-600 dark:text-teal-500">
            THE TEAL HORSE
          </Subheading>
          <Heading
            as="h2"
            className="text-4xl font-light sm:text-5xl dark:text-white"
          >
            Read stories from the Bitsacco community
          </Heading>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <div
                key={post.slug}
                className="group relative flex flex-col rounded-xl bg-white p-2 shadow-md ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:bg-slate-800/80 dark:shadow-white/5 dark:ring-white/10 dark:backdrop-blur-sm dark:hover:shadow-teal-500/20"
              >
                <div className="flex flex-1 flex-col p-8">
                  <div className="pb-3 text-lg/5 text-neutral-700 dark:text-neutral-400">
                    {dayjs(post.publishedAt).format('MMMM D, YYYY')}
                  </div>
                  <div className="mt-2 text-xl/7 font-bold text-neutral-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </div>
                  <div className="mt-2 flex-1 text-base/6 font-medium text-neutral-600 dark:text-neutral-300">
                    {post.excerpt}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center text-lg font-medium text-teal-600 transition-colors hover:text-teal-700 dark:text-teal-500 dark:hover:text-teal-400"
            >
              <ArrowRightIcon className="mr-2 inline h-5 w-5" /> Read the blog
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
