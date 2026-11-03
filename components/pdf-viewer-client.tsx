'use client'

import { ArrowSquareOutIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import useMeasure from 'react-use-measure'

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export type PdfSource = {
  /** Language button label, e.g. "English" */
  label: string
  /** Path to the PDF under /public */
  href: string
  /** Optional human-readable file size shown on the download button */
  size?: string
}

export type PdfViewerProps = {
  /** Short document name used in loading labels */
  title: string
  sources: readonly PdfSource[]
}

function ViewerShimmer({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4 py-4" aria-label={label}>
      <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-700/70" />
      <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-gray-700/60" />
      <div className="flex items-center justify-between gap-3">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-700/70" />
        <div className="h-5 w-28 animate-pulse rounded bg-gray-700/60" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-700/70" />
      </div>
    </div>
  )
}

export default function PdfViewerClient({ title, sources }: PdfViewerProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState(1)
  const [viewerRef, bounds] = useMeasure()

  const current = sources[sourceIndex] ?? sources[0]
  const currentPdf = current.href
  const pageWidth = Math.max(280, Math.floor(bounds.width || 0) - 32)

  function handleSourceChange(index: number) {
    setSourceIndex(index)
    setPageNumber(1)
    setNumPages(undefined)
  }

  function handleLoadSuccess({ numPages: loadedPages }: { numPages: number }) {
    setNumPages(loadedPages)
    setPageNumber((currentPage) => Math.min(currentPage, loadedPages))
  }

  function handlePreviousPage() {
    setPageNumber((currentPage) => Math.max(currentPage - 1, 1))
  }

  function handleNextPage() {
    setPageNumber((currentPage) =>
      numPages ? Math.min(currentPage + 1, numPages) : currentPage,
    )
  }

  return (
    <>
      {sources.length > 1 && (
        <div className="mb-4 flex items-center justify-center gap-4">
          {sources.map((source, index) => (
            <button
              key={source.href}
              type="button"
              onClick={() => handleSourceChange(index)}
              aria-pressed={index === sourceIndex}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                index === sourceIndex
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <a
            href={currentPdf}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-600"
          >
            <DownloadSimpleIcon size={18} weight="bold" />
            Download PDF
            {current.size ? (
              <span className="text-gray-300">({current.size})</span>
            ) : null}
          </a>

          <a
            href={currentPdf}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-600"
          >
            <ArrowSquareOutIcon size={18} weight="bold" />
            Open PDF
          </a>
        </div>

        <div
          ref={viewerRef}
          className="flex min-h-[24rem] flex-col items-center gap-4"
        >
          <Document
            file={currentPdf}
            onLoadSuccess={handleLoadSuccess}
            loading={<ViewerShimmer label={`Loading ${title}`} />}
            error={
              <div className="flex min-h-[24rem] flex-col items-center justify-center gap-4 text-center">
                <p className="text-gray-400">
                  The PDF could not be displayed in this browser.
                </p>
                <a
                  href={currentPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:text-teal-300 hover:underline"
                >
                  Open the PDF directly
                </a>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={<ViewerShimmer label={`Rendering ${title} page`} />}
            />
          </Document>

          <div className="flex w-full max-w-xl items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm text-gray-300">
              Page {pageNumber}
              {numPages ? ` of ${numPages}` : ''}
            </p>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={!numPages || pageNumber >= numPages}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
