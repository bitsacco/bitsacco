import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || ''

export default projectId && dataset
  ? defineCliConfig({ api: { projectId, dataset } })
  : defineCliConfig({})
