'use client'

import { SanityLogo } from '@/components/sanity-logo'
import { structure } from '@/sanity/structure'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
// @ts-expect-error - TypeScript has path resolution issues but this works at runtime
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schema'

const config = defineConfig({
  basePath: '/studio',
  icon: SanityLogo,
  projectId,
  dataset,
  schema,
  title: 'Bitsacco Workspace',
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})

export default config
