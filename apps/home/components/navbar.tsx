'use client'

import { Logo, Navbar as SharedNavbar, type NavbarButton } from '@bitsacco/ui'
import { ListIcon, XIcon } from '@phosphor-icons/react'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

const links: Array<{ href: string; label: string; external?: boolean }> = [
  { href: '/about', label: 'About' },
  { href: '/guides', label: 'Guides' },
  { href: '/blog', label: 'Blog' },
  { href: '/partners', label: 'Partners' },
  { href: '/open-source', label: 'Developers' },
]

const buttons: NavbarButton[] = [
  {
    text: 'LOGIN',
    href: `${appUrl}/auth?q=login`,
    variant: 'tealOutline' as const,
  },
]

export function Navbar({ banner }: { banner?: React.ReactNode }) {
  return (
    <SharedNavbar
      links={links}
      buttons={buttons}
      banner={banner}
      Logo={() => <Logo href="/" />}
      MenuIcon={ListIcon}
      CloseIcon={XIcon}
    />
  )
}
