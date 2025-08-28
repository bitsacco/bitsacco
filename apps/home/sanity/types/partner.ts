import { CaseIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  // eslint-disable-next-line
  icon: CaseIcon as any,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'website',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
      website: 'website',
    },
  },
})
