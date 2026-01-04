import { Footer } from '@/components/footer'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'
import { image } from '@/sanity/image'
import { getBlogs, getBlogsCount, getCategories } from '@/sanity/queries'
import { Button, Container } from '@bitsacco/ui'
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

const blogsPerPage = 5

async function Categories({ selected }: { selected?: string }) {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Menu>
        <MenuButton className="flex items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-slate-600">
          {categories.find(({ slug }) => slug === selected)?.title ||
            'All categories'}
          <CaretUpDownIcon className="size-4 text-gray-400" />
        </MenuButton>
        <MenuItems
          anchor="bottom start"
          className="min-w-48 rounded-lg border border-slate-600 bg-slate-700 p-1 shadow-lg [--anchor-gap:6px] [--anchor-offset:-4px] [--anchor-padding:10px]"
        >
          <MenuItem>
            <Link
              href="/blog"
              data-selected={selected === undefined ? true : undefined}
              className="group grid grid-cols-[20px_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-slate-600"
            >
              <CheckIcon className="group-data-selected:block hidden size-4 text-orange-400" />
              <span className="col-start-2">All categories</span>
            </Link>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.slug}>
              <Link
                href={`/blog?category=${category.slug}`}
                data-selected={category.slug === selected ? true : undefined}
                className="group grid grid-cols-[20px_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-slate-600"
              >
                <CheckIcon className="group-data-selected:block hidden size-4 text-orange-400" />
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

async function Blogs({ page, category }: { page: number; category?: string }) {
  const blogs = await getBlogs(
    (page - 1) * blogsPerPage,
    page * blogsPerPage,
    category,
  )

  if (!blogs || (blogs.length === 0 && (page > 1 || category))) {
    notFound()
  }

  if (!blogs || blogs.length === 0) {
    return (
      <p className="mx-auto text-center text-gray-400">
        No blog articles have been published yet.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {blogs.map((blog) => (
        <article
          key={blog.slug}
          className="relative border-b border-slate-700 pb-8 last:border-b-0"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col gap-3">
              <time className="text-sm font-medium text-gray-400">
                {dayjs(blog.publishedAt).format('MMM D, YYYY')}
              </time>
              {blog.author && (
                <div className="flex items-center gap-3">
                  {blog.author.image && (
                    <Image
                      alt=""
                      src={image(blog.author.image).width(32).height(32).url()}
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover ring-1 ring-slate-600"
                    />
                  )}
                  <span className="text-sm text-gray-300">
                    {blog.author.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="mb-3 text-xl font-medium tracking-tight text-white">
                {blog.title}
              </h2>
              {blog.subtitle && (
                <p className="mb-3 text-lg italic text-gray-400">
                  {blog.subtitle}
                </p>
              )}
              <p className="mb-4 leading-relaxed text-gray-300">
                {blog.excerpt}
              </p>
              <Link
                href={`/blog/${blog.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-400 hover:text-orange-300"
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

  let totalBlogs = await getBlogsCount(category)
  if (!totalBlogs) totalBlogs = 0

  const hasPreviousPage = page - 1
  const previousPageUrl = hasPreviousPage ? url(page - 1) : undefined
  const hasNextPage = page * blogsPerPage < totalBlogs
  const nextPageUrl = hasNextPage ? url(page + 1) : undefined
  const pageCount = Math.ceil(totalBlogs / blogsPerPage)

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
              'text-gray-300 hover:bg-gray-700 hover:text-white',
              'hover:bg-gray-700',
              'data-active:bg-orange-600 data-active:text-white',
              'data-active:bg-orange-500',
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
            <Heading className="text-white" as="h1">
              The Teal Horse
            </Heading>
            <Lead className="mx-auto mt-8 max-w-2xl text-gray-300">
              The latest stories, updates, and news from Bitsacco.
            </Lead>
          </div>
          <div className="space-y-12">
            <Categories selected={category} />
            <Blogs page={page} category={category} />
            <Pagination page={page} category={category} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
