'use client'

import Image from 'next/image'

export function SanityLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Bitsacco Logo"
      width={202}
      height={120}
      className={className || 'object-contain'}
      priority
    />
  )
}
