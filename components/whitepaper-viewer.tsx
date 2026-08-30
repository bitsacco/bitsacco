'use client'

import dynamic from 'next/dynamic'

function ViewerShellShimmer() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-700/70" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-700/70" />
      </div>
      <div className="flex min-h-[24rem] flex-col gap-4">
        <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-gray-700/60" />
        <div className="flex items-center justify-between gap-3">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-700/70" />
          <div className="h-5 w-28 animate-pulse rounded bg-gray-700/60" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-700/70" />
        </div>
      </div>
    </div>
  )
}

const WhitepaperViewerClient = dynamic(
  () => import('@/components/whitepaper-viewer-client'),
  {
    ssr: false,
    loading: () => <ViewerShellShimmer />,
  },
)

export default function WhitepaperViewer() {
  return <WhitepaperViewerClient />
}
