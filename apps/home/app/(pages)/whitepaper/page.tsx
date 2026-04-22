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
      <main className="min-h-screen bg-gray-900 pt-24 pb-16">
        <Container>
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center">
              Bitcoin: A Peer-to-Peer Electronic Cash System
            </h1>
            <p className="text-gray-400 mb-8">Satoshi Nakamoto</p>
            
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('sw')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  lang === 'sw'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Kiswahili
              </button>
            </div>

            <a
              href={currentPdf}
              download
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 border border-teal-500 text-teal-500 hover:bg-teal-500/10 h-9 px-4 py-2"
            >
              Download PDF
            </a>
          </div>

          <div className="w-full h-[800px] rounded-xl overflow-hidden border border-gray-800 bg-gray-800/50">
            <object
              data={currentPdf}
              type="application/pdf"
              className="w-full h-full"
            >
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-gray-400 mb-4">
                  It appears you don't have a PDF plugin for this browser.
                </p>
                <a
                  href={currentPdf}
                  className="text-teal-500 hover:underline"
                >
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
