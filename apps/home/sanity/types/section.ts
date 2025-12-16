import { defineField, defineType } from 'sanity'
import { media } from './media'

export const sectionType = defineType({
  name: 'section',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    media,
    defineField({
      name: 'steps',
      type: 'array',
      of: [{ type: 'step' }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'order',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
      stepsCount: 'steps.length',
    },
    prepare({ title, order, stepsCount }) {
      return {
        title: `${order}. ${title}`,
        subtitle: `${stepsCount || 0} step${stepsCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
