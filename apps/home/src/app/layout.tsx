import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Bitsacco - Bitcoin-powered financial services',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Bitsacco',
    url: 'https://www.bitsacco.com',
    images: [
      {
        url: '/open_graph_logo.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/open_graph_logo.png'],
    site: '@bitsacco',
    creator: '@bitsacco',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700,800,900&amp;display=swap"
        />
      </head>
      <body className="overflow-x-hidden bg-gray-900 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
