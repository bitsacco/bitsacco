'use client'

import PdfViewer from '@/components/pdf-viewer'
import type { PdfSource } from '@/components/pdf-viewer-client'
import { useState } from 'react'

type Resource = {
  id: string
  tabLabel: string
  title: string
  description: string
  credit: React.ReactNode
  sources: readonly PdfSource[]
}

const linkClass = 'text-teal-400 hover:text-teal-300 hover:underline'

const RESOURCES: readonly Resource[] = [
  {
    id: 'whitepaper',
    tabLabel: 'Bitcoin Whitepaper',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    description:
      'The original 2008 paper that introduced Bitcoin. Available in English and Kiswahili.',
    credit: <>Satoshi Nakamoto</>,
    sources: [
      { label: 'English', href: '/bitcoin-en.pdf' },
      { label: 'Kiswahili', href: '/bitcoin-sw.pdf' },
    ],
  },
  {
    id: 'kujifunza-bitcoin',
    tabLabel: 'Kujifunza Bitcoin',
    title: 'Kujifunza Bitcoin: Kuprogramu Blockchain Huria',
    description:
      'Kiswahili edition of Mastering Bitcoin (3rd edition), a full technical guide to how Bitcoin works.',
    credit: (
      <>
        Andreas M. Antonopoulos &amp; David A. Harding. Kiswahili translation
        by comwanga. Licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          CC BY-SA 4.0
        </a>
        . Original:{' '}
        <a
          href="https://github.com/bitcoinbook/bitcoinbook"
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Mastering Bitcoin
        </a>
        .
      </>
    ),
    sources: [
      {
        label: 'Kiswahili',
        href: '/kujifunza-bitcoin-sw.pdf',
        size: '7.2 MB',
      },
    ],
  },
]

export default function LearnBitcoinResources() {
  const [activeId, setActiveId] = useState(RESOURCES[0].id)
  const active = RESOURCES.find((r) => r.id === activeId) ?? RESOURCES[0]

  return (
    <>
      <div
        role="tablist"
        aria-label="Bitcoin learning resources"
        className="mb-8 flex flex-wrap justify-center gap-3"
      >
        {RESOURCES.map((resource) => {
          const selected = resource.id === active.id
          return (
            <button
              key={resource.id}
              id={`tab-${resource.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${resource.id}`}
              onClick={() => setActiveId(resource.id)}
              className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
                selected
                  ? 'border-teal-500 bg-teal-500/10 text-white'
                  : 'border-gray-800 bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {resource.tabLabel}
            </button>
          )
        })}
      </div>

      <section
        id={`panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${active.id}`}
      >
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
            {active.title}
          </h2>
          <p className="mb-2 text-gray-400">{active.credit}</p>
          <p className="text-sm text-gray-500">{active.description}</p>
        </div>

        {/* Keyed so each resource gets fresh viewer state and only the
            selected resource's PDF is fetched. */}
        <PdfViewer
          key={active.id}
          title={active.tabLabel}
          sources={active.sources}
        />
      </section>
    </>
  )
}
