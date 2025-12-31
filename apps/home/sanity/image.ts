import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { dataset, isSanityConfigured, projectId } from './env'

const builder = isSanityConfigured
  ? createImageUrlBuilder({ projectId, dataset })
  : null

// Mock image builder that returns empty strings but maintains the chainable API
const mockImageBuilder: any = {
  auto: () => mockImageBuilder,
  width: () => mockImageBuilder,
  height: () => mockImageBuilder,
  size: () => mockImageBuilder,
  format: () => mockImageBuilder,
  url: () => '',
}

export function image(source: SanityImageSource) {
  if (!builder) {
    console.warn('Sanity image builder not configured.')
    return mockImageBuilder
  }

  // Check if source has required properties
  if (
    !source ||
    typeof source !== 'object' ||
    !('asset' in source) ||
    !source.asset
  ) {
    console.warn('Invalid image source provided:', source)
    return mockImageBuilder
  }

  return builder.image(source).auto('format')
}
