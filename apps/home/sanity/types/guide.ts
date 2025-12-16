import { BookIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { media } from './media'

export const guideType = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  // eslint-disable-next-line
  icon: BookIcon as any,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) =>
        Rule.required().error('A slug is required for the guide URL.'),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'Brief description of what this guide covers',
    }),
    defineField({
      name: 'objectives',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What users will learn or achieve',
    }),
    defineField({
      name: 'outcomes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Expected results after completing this guide',
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: { type: 'guideCategory' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'guideTag' } }],
    }),
    media,
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      initialValue: false,
      description: 'Featured guides appear prominently on the guides page',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hasComplexStructure',
      type: 'boolean',
      initialValue: false,
      description: 'Enable this for guides with sections and subsections',
    }),
    defineField({
      name: 'steps',
      type: 'array',
      of: [{ type: 'step' }],
      validation: (Rule) => Rule.min(1),
      hidden: ({ parent }) => parent?.hasComplexStructure,
    }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [{ type: 'section' }],
      validation: (Rule) => Rule.min(1),
      hidden: ({ parent }) => !parent?.hasComplexStructure,
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'prerequisites',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'guide' } }],
      description: 'Guides that should be completed before this one',
    }),
    defineField({
      name: 'relatedGuides',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'guide' } }],
      description: 'Related or follow-up guides',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'media.image',
      category: 'category.title',
      isFeatured: 'isFeatured',
    },
    prepare({ title, category, media, isFeatured }) {
      return {
        title,
        subtitle: [category, isFeatured ? 'Featured' : null]
          .filter(Boolean)
          .join(' • '),
        media,
      }
    },
  },
  orderings: [
    {
      name: 'featuredAndPublished',
      title: 'Featured & Latest Published',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
    {
      name: 'categoryAndPublished',
      title: 'Category & Published Date',
      by: [
        { field: 'category.title', direction: 'asc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],
})
