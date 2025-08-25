import Link from 'next/link'
import { image } from '@/sanity/image'
import { getPartners } from '@/sanity/queries'
import { PartnersCarousel } from './partners-carousel'

export async function Partners() {
  const partners = await getPartners()

  if (!partners || partners.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold">Trusted By</h2>

        {/* If few partners, show centered without scroll */}
        {partners.length <= 5 ? (
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
            {partners.map((partner) => (
              <div key={partner._id} className="flex-none">
                <div className="group flex flex-col items-center text-center">
                  {partner.logo && partner.logo.asset && (
                    <div className="mb-4 flex h-12 w-24 items-center justify-center sm:h-16 sm:w-32 md:h-20 md:w-36">
                      <img
                        src={image(partner.logo).url()}
                        alt={`${partner.name} logo`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  {partner.website ? (
                    <Link
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      {partner.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {partner.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* If many partners, show carousel */
          <PartnersCarousel partners={partners} />
        )}
      </div>
    </section>
  )
}
