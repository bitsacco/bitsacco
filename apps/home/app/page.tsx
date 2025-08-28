import { FAQSection } from '@/components/faq'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Heading } from '@/components/text'
import { Button, Container, Hero as SharedHero } from '@bitsacco/ui'
import type { Metadata } from 'next'
import Image from 'next/image'

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
        {
          text: 'SIGNUP',
          href: `${appUrl}/auth?q=signup`,
          variant: 'tealPrimary',
        },
      ]}
    />
  )
}

function FeaturesSection() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  const features = [
    {
      title: 'Membership',
      description:
        'Become a registered member of Bitsacco with shares. You earn dividends on your shares, access all other features, and can participate in governance of the SACCO and community.',
      icon: '/member.svg',
      buttonText: 'Get Shares',
      buttonLink: `${appUrl}/membership`,
    },
    {
      title: 'Personal Savings',
      description:
        'Start accumulating wealth by saving in Bitcoin. We help you secure your savings, and support you through time tested investment strategies like cost averaging and automation of investments.',
      icon: '/savings.svg',
      buttonText: 'Start Saving',
      buttonLink: `${appUrl}/personal`,
    },
    {
      title: 'Chama Savings',
      description:
        'Create or join an investment groups with friends, family and colleagues. We help you manage your group investments, track contributions and investments and provide solutions for efficient and fair Chamas.',
      icon: '/community.svg',
      buttonText: 'Start Saving',
      buttonLink: `${appUrl}/chama`,
    },
    {
      title: 'Loans',
      description:
        'Access loan facilities using your Bitcoin savings as collateral. Borrow as an individual, or as a Chama. We provide you with access to credit facilities at competitive rates, and with flexible repayment terms.',
      icon: '/credit.svg',
      buttonText: 'Coming Soon',
      buttonLink: '#',
      isComingSoon: true,
    },
  ]

  return (
    <section className="bg-slate-900 py-24">
      <Container>
        <div className="mb-12 text-center">
          <Heading as="h2" className="mb-4 text-4xl font-bold text-white">
            ACCESS THESE FEATURES
          </Heading>
          <p className="text-lg text-gray-300">
            Enjoy these everyday financial features using Bitcoin, from within
            Bitsacco
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-teal-500/50 transition-all duration-300 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/20"
            >
              {/* Slate upper section */}
              <div className="relative h-32 bg-slate-700/50">
                {/* Icon positioned at the boundary */}
                <div className="absolute -bottom-12 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-900 bg-white">
                  <Image
                    src={feature.icon}
                    alt={`${feature.title} icon`}
                    width={64}
                    height={64}
                    className="h-16 w-16"
                  />
                </div>
              </div>

              {/* Dark lower section with content */}
              <div className="flex flex-1 flex-col bg-slate-900/90 px-6 pb-6 pt-16 text-center">
                <h3 className="mb-4 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-300">
                  {feature.description}
                </p>
                {feature.isComingSoon ? (
                  <div className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-700 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    {feature.buttonText}
                  </div>
                ) : (
                  <Button
                    href={feature.buttonLink}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-teal-600"
                  >
                    {feature.buttonText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Hero />
        <FeaturesSection />
        <FAQSection />
        <Footer />
      </main>
    </>
  )
}
