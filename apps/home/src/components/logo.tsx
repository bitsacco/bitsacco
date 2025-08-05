'use client'

import { clsx } from 'clsx'
import Image from 'next/image'

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Bitsacco Logo"
      width={202}
      height={120}
      className={clsx(className, 'object-contain')}
      priority
    />
  )
}
