import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'
import { getPage } from '@/sanity/queries'
import { Metadata } from 'next'
import { PortableText } from 'next-sanity'

export const metadata: Metadata = {
  title: 'Open Source | Bitsacco',
  description:
    "Learn about Bitsacco's open source initiatives and contributions to the Bitcoin ecosystem.",
}

export default async function OpenSourcePage() {
  // Try to fetch the open-source page from Sanity
  const page = await getPage('open-source')

  if (!page) {
    // If no Sanity content exists, show a default page
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <Container className="py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Heading
                as="h1"
                className="mb-6 text-4xl font-bold text-white sm:text-5xl"
              >
                Open Source at Bitsacco
              </Heading>
              <Lead className="mb-12 text-xl text-gray-300">
                We believe in the power of open source to drive innovation in
                Bitcoin financial services.
              </Lead>

              <div className="prose prose-lg prose-invert mx-auto text-left">
                <h2>Our Commitment</h2>
                <p>
                  Bitsacco is committed to contributing to the open source
                  ecosystem. We believe that transparency and collaboration are
                  key to building secure and reliable financial infrastructure.
                </p>

                <h2>Projects</h2>
                <p>
                  Visit our{' '}
                  <a
                    href="https://github.com/bitsacco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    GitHub organization
                  </a>{' '}
                  to explore our open source projects and contributions.
                </p>

                <h2>Contributing</h2>
                <p>
                  We welcome contributions from the community. Whether you're
                  fixing bugs, adding features, or improving documentation, your
                  help is appreciated.
                </p>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    )
  }

  // If Sanity content exists, render it
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Container className="py-24">
          <article className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <Heading
                as="h1"
                className="mb-6 text-4xl font-bold text-white sm:text-5xl"
              >
                {page.title}
              </Heading>
              {page.excerpt && (
                <Lead className="text-xl text-gray-300">{page.excerpt}</Lead>
              )}
            </div>

            {page.body && (
              <div className="prose prose-lg prose-invert mx-auto">
                <PortableText value={page.body} />
              </div>
            )}
          </article>
        </Container>
      </main>
      <Footer />
    </>
  )
}
