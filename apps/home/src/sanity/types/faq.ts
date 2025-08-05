import { defineField, defineType } from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'general' },
          { title: 'SACCO', value: 'sacco' },
          { title: 'Chama', value: 'chama' },
          { title: 'Bitcoin', value: 'bitcoin' },
          { title: 'Savings', value: 'savings' },
          { title: 'Technical', value: 'technical' },
        ],
      },
      initialValue: 'general',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'question',
      order: 'order',
      active: 'isActive',
      category: 'category',
    },
    prepare(selection) {
      const { title, order, active, category } = selection
      return {
        title: `${order}. ${title}`,
        subtitle: `${category} - ${active ? 'Active' : 'Inactive'}`,
      }
    },
  },
})
