import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'
import { image } from '@/sanity/image'
import { getCategories, getPosts, getPostsCount } from '@/sanity/queries'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CheckIcon,
  RssIcon,
} from '@phosphor-icons/react/dist/ssr'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const title = 'The Teal Horse | Bitsacco Blog'
const description = 'The latest stories, updates, and news from Bitsacco.'
const canonical = 'https://www.bitsacco.com/blog'

export const metadata: Metadata = {
  title: `${title}`,
  description: `${description}`,
  publisher: `https://linkedin.com/company/bitsacco`,
  alternates: {
    canonical: `${canonical}`,
  },
  openGraph: {
    title: `${title}`,
  },
}

const postsPerPage = 5

async function Categories({ selected }: { selected?: string }) {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Menu>
        <MenuButton className="bg-neutral-0 flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
          {categories.find(({ slug }) => slug === selected)?.title ||
            'All categories'}
          <CaretUpDownIcon className="size-4 text-neutral-500" />
        </MenuButton>
        <MenuItems
          anchor="bottom start"
          className="bg-neutral-0 min-w-48 rounded-lg border border-neutral-200 p-1 shadow-lg [--anchor-gap:6px] [--anchor-offset:-4px] [--anchor-padding:10px] dark:border-neutral-700 dark:bg-neutral-900"
        >
          <MenuItem>
            <Link
              href="/blog"
              data-selected={selected === undefined ? true : undefined}
              className="group grid grid-cols-[20px_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <CheckIcon className="hidden size-4 text-orange-600 group-data-selected:block dark:text-orange-400" />
              <span className="col-start-2">All categories</span>
            </Link>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.slug}>
              <Link
                href={`/blog?category=${category.slug}`}
                data-selected={category.slug === selected ? true : undefined}
                className="group grid grid-cols-[20px_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <CheckIcon className="hidden size-4 text-orange-600 group-data-selected:block dark:text-orange-400" />
                <span className="col-start-2">{category.title}</span>
              </Link>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
      <Button variant="outline" href="/blog/feed.xml" className="gap-2">
        <RssIcon className="size-4" />
        RSS Feed
      </Button>
    </div>
  )
}

async function Posts({ page, category }: { page: number; category?: string }) {
  const posts = await getPosts(
    (page - 1) * postsPerPage,
    page * postsPerPage,
    category,
  )

  if (!posts || (posts.length === 0 && (page > 1 || category))) {
    notFound()
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="mx-auto text-center text-neutral-500 dark:text-neutral-400">
        No blog posts have been published yet.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="relative border-b border-neutral-200 pb-8 last:border-b-0 dark:border-neutral-800"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col gap-3">
              <time className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {dayjs(post.publishedAt).format('MMM D, YYYY')}
              </time>
              {post.author && (
                <div className="flex items-center gap-3">
                  {post.author.image && (
                    <Image
                      alt=""
                      src={image(post.author.image).width(32).height(32).url()}
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                    />
                  )}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {post.author.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="dark:text-neutral-0 mb-3 text-xl font-medium tracking-tight text-neutral-950">
                {post.title}
              </h2>
              <p className="mb-4 leading-relaxed text-neutral-600 dark:text-neutral-300">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                <span className="absolute inset-0" />
                Read article
                <CaretRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

async function Pagination({
  page,
  category,
}: {
  page: number
  category?: string
}) {
  function url(page: number) {
    const params = new URLSearchParams()

    if (category) params.set('category', category)
    if (page > 1) params.set('page', page.toString())

    return params.size !== 0 ? `/blog?${params.toString()}` : '/blog'
  }

  let totalPosts = await getPostsCount(category)
  if (!totalPosts) totalPosts = 0

  const hasPreviousPage = page - 1
  const previousPageUrl = hasPreviousPage ? url(page - 1) : undefined
  const hasNextPage = page * postsPerPage < totalPosts
  const nextPageUrl = hasNextPage ? url(page + 1) : undefined
  const pageCount = Math.ceil(totalPosts / postsPerPage)

  if (pageCount < 2) {
    return null
  }

  return (
    <nav className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        href={previousPageUrl}
        disabled={!previousPageUrl}
      >
        <CaretLeftIcon className="size-4" />
        Previous
      </Button>
      <div className="flex gap-1 max-sm:hidden">
        {Array.from({ length: pageCount }, (_, i) => (
          <Link
            key={i + 1}
            href={url(i + 1)}
            data-active={i + 1 === page ? true : undefined}
            className={clsx(
              'flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950',
              'dark:hover:text-neutral-0 dark:text-neutral-400 dark:hover:bg-neutral-800',
              'data-active:bg-orange-600 data-active:text-white',
              'dark:data-active:bg-orange-500',
            )}
          >
            {i + 1}
          </Link>
        ))}
      </div>
      <Button variant="outline" href={nextPageUrl} disabled={!nextPageUrl}>
        Next
        <CaretRightIcon className="size-4" />
      </Button>
    </nav>
  )
}

export default async function Blog(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const page =
    'page' in searchParams
      ? typeof searchParams.page === 'string' && parseInt(searchParams.page) > 1
        ? parseInt(searchParams.page)
        : notFound()
      : 1

  const category =
    typeof searchParams.category === 'string'
      ? searchParams.category
      : undefined

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <div className="mb-16 text-center">
            <Heading className="dark:text-neutral-0 text-neutral-950" as="h1">
              The Teal Horse
            </Heading>
            <Lead className="mx-auto mt-8 max-w-2xl text-neutral-600 dark:text-neutral-400">
              The latest stories, updates, and news from Bitsacco.
            </Lead>
          </div>
          <div className="space-y-12">
            <Categories selected={category} />
            <Posts page={page} category={category} />
            <Pagination page={page} category={category} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
