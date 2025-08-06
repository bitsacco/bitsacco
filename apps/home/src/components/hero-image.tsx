import { clsx } from 'clsx'
import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function HeroImage({
  src,
  alt,
  className,
  width = 1920,
  height = 1080,
  priority = false,
}: HeroImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={clsx(
        'w-full rounded-xl object-cover shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800',
        className,
      )}
    />
  )
}
