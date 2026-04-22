'use client'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Container } from '@bitsacco/ui'
import { useState } from 'react'

export default function WhitepaperPage() {
  const [lang, setLang] = useState<'en' | 'sw'>('en')

  const currentPdf = lang === 'en' ? '/bitcoin-en.pdf' : '/bitcoin-sw.pdf'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 pb-16 pt-24">
        <Container>
          <div className="mb-8 flex flex-col items-center">
            <h1 className="mb-4 text-center text-3xl font-bold text-white md:text-5xl">
              Bitcoin: A Peer-to-Peer Electronic Cash System
            </h1>
            <p className="mb-8 text-gray-400">Satoshi Nakamoto</p>

            <div className="mb-8 flex gap-4">
              <button
                onClick={() => setLang('en')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('sw')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  lang === 'sw'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Kiswahili
              </button>
            </div>
          </div>

          <div className="h-[800px] w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-800/50">
            <object
              data={currentPdf}
              type="application/pdf"
              className="h-full w-full"
            >
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <p className="mb-4 text-gray-400">
                  It appears you don&apos;t have a PDF plugin for this browser.
                </p>
                <a href={currentPdf} className="text-teal-500 hover:underline">
                  Click here to download the PDF file.
                </a>
              </div>
            </object>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
