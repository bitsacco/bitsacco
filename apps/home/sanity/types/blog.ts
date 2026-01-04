import { DocumentTextIcon } from '@sanity/icons'
import { groq } from 'next-sanity'
import { defineField, defineType } from 'sanity'
import { apiVersion } from '../env'

export const blogType = defineType({
  name: 'blog',
  title: 'Blog',
  type: 'document',
  // eslint-disable-next-line
  icon: DocumentTextIcon as any,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'The main title of the blog post',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      description: 'Optional subtitle for the blog post',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description:
        'URL-friendly version of the title (automatically generated from title)',
      options: {
        source: 'title',
      },
      validation: (Rule) =>
        Rule.required().error('A slug is required for the blog URL.'),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      description:
        'When this blog post should be published (used for sorting and scheduling)',
      validation: (Rule) =>
        Rule.required().error(
          'A publication date is required for ordering blogs.',
        ),
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      description:
        'Mark this post as featured (only 3 posts can be featured at a time)',
      initialValue: false,
      validation: (Rule) =>
        Rule.custom(async (isFeatured, { getClient }) => {
          if (isFeatured !== true) {
            return true
          }

          const featuredBlogs = await getClient({ apiVersion })
            .withConfig({ perspective: 'previewDrafts' })
            .fetch<number>(
              groq`count(*[_type == 'blog' && isFeatured == true])`,
            )

          return featuredBlogs > 3
            ? 'Only 3 blogs can be featured at a time.'
            : true
        }),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      description: 'The author who wrote this blog post',
      to: { type: 'author' },
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      description:
        'Main image for the blog post (shown in listings and at the top of the post)',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'categories',
      type: 'array',
      description: 'Categories to help organize and filter blog posts',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      description:
        'Short summary of the blog post (shown in listings and search results)',
      rows: 3,
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      description:
        'Main content of the blog post (rich text with images, links, etc.)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      author: 'author.name',
      isFeatured: 'isFeatured',
    },
    prepare({ title, author, media, isFeatured }) {
      return {
        title,
        subtitle: [isFeatured && 'Featured', author && `By ${author}`]
          .filter(Boolean)
          .join(' | '),
        media,
      }
    },
  },
  orderings: [
    {
      name: 'isFeaturedAndPublishedAtDesc',
      title: 'Featured & Latest Published',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],
})
