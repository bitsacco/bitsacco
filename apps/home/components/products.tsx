import { getPagesByTag } from '@/sanity/queries'
import { Container } from '@bitsacco/ui'
import { Heading, Subheading } from './text'

const KNOWN_PRODUCT_PAGE_TAG = 'product-page'

export async function ProductsSection() {
  const productPages = await getPagesByTag(KNOWN_PRODUCT_PAGE_TAG)

  if (!productPages || productPages.length === 0) {
    return null
  }

  return (
    <section className="bg-neutral-50 py-32 dark:bg-gradient-to-b dark:from-neutral-950 dark:via-black dark:to-neutral-900">
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Subheading className="mb-8 text-lg font-semibold tracking-wider text-orange-600 dark:text-orange-600">
            WHAT WE OFFER
          </Subheading>
          <Heading
            as="h2"
            className="text-4xl font-light sm:text-5xl dark:text-white"
          >
            Get everything you need to build financial products
          </Heading>
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {productPages?.map((page, index) => (
            <ProductCard
              key={page.slug || index}
              title={page.title || ''}
              excerpt={page.excerpt || ''}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

function ProductCard({ title, excerpt }: { title: string; excerpt: string }) {
  return (
    <div className="dark:hover:shadow-primary/10 group relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white p-8 transition-all duration-300 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 dark:border-neutral-700/50 dark:bg-neutral-900/80 dark:backdrop-blur-sm dark:hover:border-neutral-600 dark:hover:shadow-lg dark:hover:shadow-black/20">
      <h3 className="mb-4 text-xl font-medium text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {excerpt}
      </p>
    </div>
  )
}
