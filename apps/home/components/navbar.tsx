'use client'

import { Navbar as SharedNavbar } from '@bitsacco/ui'
import { ListIcon, XIcon } from '@phosphor-icons/react'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

const links: Array<{ href: string; label: string; external?: boolean }> = [
  { href: '/blog', label: 'BLOG' },
]

export function Navbar({ banner }: { banner?: React.ReactNode }) {
  return (
    <SharedNavbar
      links={links}
      appUrl={appUrl}
      banner={banner}
      showAuth={true}
      logoHref="/"
      MenuIcon={ListIcon}
      CloseIcon={XIcon}
    />
  )
}
