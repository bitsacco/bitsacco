#!/usr/bin/env node

// Check if Sanity is configured before running schema extraction
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  console.log('Sanity not configured. Skipping schema extraction.');
  process.exit(0);
}

// If configured, run the typegen command
const { execSync } = require('child_process');
try {
  execSync('npm run extract && sanity typegen generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to generate types:', error.message);
  process.exit(1);
}
