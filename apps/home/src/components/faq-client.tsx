'use client'

import { ChevronDownIcon } from '@sanity/icons'
import { useState } from 'react'
import type { ValidFAQ } from '@/types/faq'

interface FAQClientProps {
  faqs: ValidFAQ[]
}

export function FAQClient({ faqs }: FAQClientProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {faqs.map((faq) => (
        <div
          key={faq._id}
          className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/50 transition-all duration-200 hover:border-gray-600 hover:shadow-lg"
        >
          <button
            onClick={() => toggleItem(faq._id)}
            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-800"
          >
            <span className="text-lg font-medium text-white">
              {faq.question}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                openItems.includes(faq._id) ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openItems.includes(faq._id) ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="border-t border-gray-700 p-6 pt-4">
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
