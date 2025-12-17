import { FAQSection } from '@/components/faq'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Hero as SharedHero } from '@bitsacco/ui'
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

function Hero() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  return (
    <SharedHero
      title={{
        first: 'LEARN',
        highlight: 'SAVE',
        last: 'GROW',
      }}
      badge="USING BITCOIN"
      description="Empower your community with Bitcoin financial education and tools. Learn together, Save together, Grow together."
      buttons={[
        {
          text: 'LOGIN',
          href: `${appUrl}/auth?q=login`,
          variant: 'tealOutline',
        },
      ]}
    />
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Hero />
        <FAQSection />
        <Footer />
      </main>
    </>
  )
}
