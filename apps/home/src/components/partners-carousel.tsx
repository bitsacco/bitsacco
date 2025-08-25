'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { image } from '@/sanity/image'
import { type PARTNERS_QUERYResult } from '@/sanity/types'

interface PartnersCarouselProps {
  partners: PARTNERS_QUERYResult
}

export function PartnersCarousel({ partners }: PartnersCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      checkScroll()
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      const targetScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative mx-auto max-w-7xl">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className={`absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-opacity dark:bg-gray-800 ${
          canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Scroll left"
      >
        <svg
          className="h-6 w-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className={`absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-opacity dark:bg-gray-800 ${
          canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Scroll right"
      >
        <svg
          className="h-6 w-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-none flex gap-6 overflow-x-auto px-12 sm:gap-8 md:gap-12"
      >
        {partners.map((partner) => (
          <div key={partner._id} className="flex-none">
            <div className="group flex flex-col items-center text-center">
              {partner.logo && partner.logo.asset && (
                <div className="mb-4 flex h-12 w-24 items-center justify-center sm:h-16 sm:w-32 md:h-20 md:w-36">
                  <img
                    src={image(partner.logo).url()}
                    alt={`${partner.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              {partner.website ? (
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  {partner.name}
                </Link>
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {partner.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
