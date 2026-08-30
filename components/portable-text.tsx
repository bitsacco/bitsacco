import { image } from '@/sanity/image'
import type { PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'

export const portableTextComponents: PortableTextComponents = {
  types: {
    separator: () => (
      <hr className="my-8 border-t border-gray-200 dark:border-gray-700" />
    ),
    image: ({ value }) => {
      if (!value?.asset) {
        return null
      }

      return (
        <figure className="my-6">
          <Image
            src={image(value).width(800).url()}
            alt={value.alt || 'Guide image'}
            width={800}
            height={600}
            className="h-auto w-full rounded-lg object-contain"
            style={{ width: '100%', height: 'auto' }}
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-base leading-relaxed">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-8 text-xl font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-4 text-lg font-medium">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-gray-300 pl-6 italic text-gray-700 dark:border-gray-600 dark:text-gray-300">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc pl-6">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal pl-6">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-2">{children}</li>,
    number: ({ children }) => <li className="mb-2">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http')
        ? '_blank'
        : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          {children}
        </a>
      )
    },
  },
}
