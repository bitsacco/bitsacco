'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { Logo } from '@/components/logo'
import { structure } from '@/sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schema'

const config = defineConfig({
  basePath: '/studio',
  icon: Logo,
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
