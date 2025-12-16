import { FAQSection } from '@/components/faq'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Hero as SharedHero } from '@bitsacco/ui'
import type { Metadata } from 'next'

const title = 'Bitsacco'
const description =
  'Bitsacco provides Bitcoin-powered financial services for Africa. Plan your finances. Save towards targets. Grow your finances together with community, friends and family.'
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
        first: 'PLAN',
        highlight: 'SAVE',
        last: 'GROW',
      }}
      badge="USING BITCOIN"
      description="Plan your finances. Save towards targets. Grow your finances together with community, friends and family."
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
