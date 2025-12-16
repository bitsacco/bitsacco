import { defineField } from 'sanity'

export const media = defineField({
  name: 'media',
  type: 'object',
  fields: [
    {
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video File', value: 'video' },
          { title: 'YouTube Video', value: 'youtube' },
          { title: 'Vimeo Video', value: 'vimeo' },
          { title: 'External Video', value: 'external' },
        ],
      },
      initialValue: 'image',
    },
    {
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      hidden: ({ parent }) => (parent as { type?: string })?.type !== 'image',
    },
    {
      name: 'video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      hidden: ({ parent }) => (parent as { type?: string })?.type !== 'video',
    },
    {
      name: 'youtubeUrl',
      type: 'url',
      title: 'YouTube URL',
      description:
        'Full YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)',
      validation: (Rule) =>
        Rule.custom((url: string, { parent }) => {
          if ((parent as { type?: string })?.type !== 'youtube') return true
          if (!url) return 'YouTube URL is required'
          if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return 'Please enter a valid YouTube URL'
          }
          return true
        }),
      hidden: ({ parent }) => (parent as { type?: string })?.type !== 'youtube',
    },
    {
      name: 'vimeoUrl',
      type: 'url',
      title: 'Vimeo URL',
      description: 'Full Vimeo video URL (e.g., https://vimeo.com/VIDEO_ID)',
      validation: (Rule) =>
        Rule.custom((url: string, { parent }) => {
          if ((parent as { type?: string })?.type !== 'vimeo') return true
          if (!url) return 'Vimeo URL is required'
          if (!url.includes('vimeo.com')) {
            return 'Please enter a valid Vimeo URL'
          }
          return true
        }),
      hidden: ({ parent }) => (parent as { type?: string })?.type !== 'vimeo',
    },
    {
      name: 'externalUrl',
      type: 'url',
      title: 'External Video URL',
      description:
        'Direct link to video file or hosted video (Google Drive, Dropbox, etc.)',
      validation: (Rule) =>
        Rule.custom((url: string, { parent }) => {
          if ((parent as { type?: string })?.type !== 'external') return true
          if (!url) return 'External video URL is required'
          return true
        }),
      hidden: ({ parent }) =>
        (parent as { type?: string })?.type !== 'external',
    },
    {
      name: 'title',
      type: 'string',
      title: 'Video Title',
      description: 'Title for the video (optional)',
      hidden: ({ parent }) => {
        const parentType = (parent as { type?: string })?.type
        return (
          !parentType || !['youtube', 'vimeo', 'external'].includes(parentType)
        )
      },
    },
    {
      name: 'description',
      type: 'text',
      title: 'Video Description',
      description: 'Description for the video (optional)',
      rows: 2,
      hidden: ({ parent }) => {
        const parentType = (parent as { type?: string })?.type
        return (
          !parentType || !['youtube', 'vimeo', 'external'].includes(parentType)
        )
      },
    },
  ],
})
