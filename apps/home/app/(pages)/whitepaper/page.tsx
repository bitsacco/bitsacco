import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import WhitepaperViewer from '@/components/whitepaper-viewer'
import { Container } from '@bitsacco/ui'

export default function WhitepaperPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 pb-16 pt-24">
        <Container>
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="mb-8 flex flex-col items-center">
              <h1 className="mb-4 text-center text-3xl font-bold text-white md:text-5xl">
                Bitcoin: A Peer-to-Peer Electronic Cash System
              </h1>
              <p className="mb-8 text-gray-400">Satoshi Nakamoto</p>
            </div>

            <WhitepaperViewer />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
