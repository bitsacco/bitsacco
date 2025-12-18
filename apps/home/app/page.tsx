import { FAQSection } from '@/components/faq'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Hero } from '@bitsacco/ui'
import type { Metadata } from 'next'

const title = 'Bitsacco'
const description =
  'Bitsacco empowers communities through Bitcoin financial education and tools. Learn, Save, and Grow together, using community-first financial solutions.'
const canonical = 'https://www.bitsacco.com'

export const metadata: Metadata = {
  title: `${title}`,
  description: `${description}`,
  alternates: {
    canonical: `${canonical}`,
  },
  openGraph: {
    title: `${title}`,
    description: `${description}`,
  },
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Hero
          title={{
            first: 'LEARN',
            highlight: 'SAVE',
            last: 'GROW',
          }}
          badge="USING BITCOIN"
          description="Empower your community with Bitcoin financial education and tools. Learn together, Save together, Grow together."
          buttons={[
            {
              text: 'Join the Community',
              href: `/guides`,
              variant: 'tealOutline',
            },
            {
              text: 'Become a Partner',
              href: `/partners`,
              variant: 'tealOutline',
            },
          ]}
        />
        <FAQSection />
        <Footer />
      </main>
    </>
  )
}
