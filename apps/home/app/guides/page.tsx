import { Footer } from '@/components/footer'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'
import { image } from '@/sanity/image'
import { getGuideCategories, getGuides, getGuidesCount } from '@/sanity/queries'
import { Button, Container } from '@bitsacco/ui'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  BookOpenIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CheckIcon,
  ListBulletsIcon,
  StarIcon,
} from '@phosphor-icons/react/dist/ssr'
import { clsx } from 'clsx'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const title = 'Bitsacco Guides'
const subtitle = 'Learn all about Bitsacco Community, its Features and Benefits'
const description =
  'Step-by-step guides to help you join, participate and make the most out of Bitsacco Community'
const canonical = 'https://www.bitsacco.com/guides'

export const metadata: Metadata = {
  title: `${title} | ${subtitle}`,
  description: `${description}`,
  publisher: `https://linkedin.com/company/bitsacco`,
  alternates: {
    canonical: `${canonical}`,
  },
  openGraph: {
    title: `${title}`,
  },
}

const guidesPerPage = 6

async function Categories({ selected }: { selected?: string }) {
  const categories = await getGuideCategories()

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <Menu>
      <MenuButton className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
        {categories.find(({ slug }) => slug === selected)?.title ||
          'All categories'}
        <CaretUpDownIcon className="size-4 text-neutral-500" />
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        className="min-w-48 rounded-lg border border-neutral-200 bg-neutral-0 p-1 shadow-lg [--anchor-gap:6px] [--anchor-offset:-4px] [--anchor-padding:10px] dark:border-neutral-700 dark:bg-neutral-900"
      >
        <MenuItem>
          <Link
            href="/guides"
            data-selected={selected === undefined ? true : undefined}
            className="group grid grid-cols-[20px_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <CheckIcon className="group-data-selected:block hidden size-4 text-orange-600 dark:text-orange-400" />
            <span className="col-start-2">All categories</span>
          </Link>
        </MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.slug}>
            <Link
              href={`/guides?category=${category.slug}`}
              data-selected={category.slug === selected ? true : undefined}
              className="group grid grid-cols-[20px_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <CheckIcon className="group-data-selected:block hidden size-4 text-orange-600 dark:text-orange-400" />
              <span className="col-start-2">{category.title}</span>
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}

async function Guides({ page, category }: { page: number; category?: string }) {
  const guides = await getGuides(
    (page - 1) * guidesPerPage,
    page * guidesPerPage,
    category,
  )

  if (!guides || (guides.length === 0 && page > 1)) {
    notFound()
  }

  if (!guides || guides.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpenIcon className="mx-auto mb-4 size-12 text-neutral-400" />
        <p className="text-neutral-500 dark:text-neutral-400">
          {category
            ? `No guides found matching your filters. Try adjusting your search criteria.`
            : `No guides have been published yet. Check back soon!`}
        </p>
        {category && (
          <Link
            href="/guides"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Clear filters
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <article
          key={guide.slug}
          className="group relative rounded-lg border border-neutral-200 bg-neutral-0 p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-teal-800"
        >
          <Link href={`/guides/${guide.slug}`} className="absolute inset-0" />

          {guide.isFeatured && (
            <div className="absolute right-4 top-4">
              <StarIcon className="size-5 text-teal-500" />
            </div>
          )}

          {guide.media && guide.media.type === 'image' && guide.media.image && (
            <div className="mb-4 aspect-video overflow-hidden rounded-lg">
              <Image
                src={image(guide.media.image).width(300).height(200).url()}
                alt={guide.media.image.alt || guide.title}
                width={300}
                height={200}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {guide.category && (
                <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  {guide.category.title}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-neutral-950 transition-colors group-hover:text-teal-600 dark:text-neutral-0 dark:group-hover:text-teal-400">
              {guide.title}
            </h3>

            <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
              {guide.excerpt}
            </p>

            {guide.objectives && guide.objectives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  What you&apos;ll learn:
                </h4>
                <ul className="space-y-1">
                  {guide.objectives.slice(0, 2).map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      <CheckIcon className="mt-0.5 size-3 flex-shrink-0 text-teal-500" />
                      {objective}
                    </li>
                  ))}
                  {guide.objectives.length > 2 && (
                    <li className="text-xs text-neutral-500 dark:text-neutral-500">
                      +{guide.objectives.length - 2} more objectives
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <ListBulletsIcon className="size-3" />
                  {guide.hasComplexStructure
                    ? `${guide.sectionsCount} sections`
                    : `${guide.stepsCount} steps`}
                </div>
              </div>

              {guide.author && (
                <div className="flex items-center gap-2">
                  {guide.author.image && (
                    <Image
                      alt=""
                      src={image(guide.author.image).width(20).height(20).url()}
                      width={20}
                      height={20}
                      className="size-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {guide.author.name}
                  </span>
                </div>
              )}
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

    return params.size !== 0 ? `/guides?${params.toString()}` : '/guides'
  }

  let totalGuides = await getGuidesCount(category)
  if (!totalGuides) totalGuides = 0

  const hasPreviousPage = page - 1
  const previousPageUrl = hasPreviousPage ? url(page - 1) : undefined
  const hasNextPage = page * guidesPerPage < totalGuides
  const nextPageUrl = hasNextPage ? url(page + 1) : undefined
  const pageCount = Math.ceil(totalGuides / guidesPerPage)

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
              'dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-0',
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

export default async function GuidesPage(props: {
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
            <Heading className="text-neutral-950 dark:text-neutral-0" as="h1">
              {title}
            </Heading>
            <Lead className="mx-auto mt-8 max-w-2xl text-neutral-600 dark:text-neutral-400">
              {description}
            </Lead>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <Categories selected={category} />
            </div>
          </div>

          <div className="space-y-12">
            <Guides page={page} category={category} />
            <Pagination page={page} category={category} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
