import { Footer } from '@/components/footer'
import LearnBitcoinResources from '@/components/learn-bitcoin-resources'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn about Bitcoin | Bitsacco',
  description:
    'Read the Bitcoin whitepaper in English and Kiswahili, and Kujifunza Bitcoin, the Kiswahili edition of Mastering Bitcoin.',
}

export default function LearnBitcoinPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 pb-16 pt-24">
        <Container>
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="mb-8 flex flex-col items-center">
              <h1 className="mb-4 text-center text-3xl font-bold text-white md:text-5xl">
                Learn about Bitcoin
              </h1>
              <p className="text-center text-gray-400">
                Foundational Bitcoin reading, free to read online or download.
              </p>
            </div>

            <LearnBitcoinResources />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
