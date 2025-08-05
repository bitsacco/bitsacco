'use client'

import { Container } from '@/components/container'
import { PlusGrid, PlusGridItem, PlusGridRow } from '@/components/plus-grid'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { ListIcon, XIcon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Button } from './button'
import { Link } from './link'
import { Logo } from './logo'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

const links: Array<{ href: string; label: string; external?: boolean }> = [
  { href: '/blog', label: 'BLOG' },
]

function DesktopNav() {
  return (
    <nav className="relative hidden items-center gap-2 lg:flex">
      {links.map(({ href, label, external }) => (
        <Link
          key={href}
          href={href}
          className="px-6 py-2.5 text-base font-semibold text-gray-100 transition-colors hover:text-teal-400"
          {...(external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {label}
        </Link>
      ))}
      <Button
        href={`${appUrl}/auth?q=login`}
        className="ml-4 inline-flex items-center justify-center rounded-sm border-2 border-teal-400 bg-transparent px-8 py-2.5 text-sm font-semibold tracking-wide text-teal-400 uppercase transition-all hover:bg-teal-400 hover:text-gray-900"
      >
        LOGIN
      </Button>
      <Button
        href={`${appUrl}/auth?q=signup`}
        className="inline-flex items-center justify-center rounded-sm bg-teal-400 px-10 py-3 text-sm font-semibold tracking-wide text-gray-900 uppercase transition-all hover:bg-teal-500"
      >
        SIGNUP
      </Button>
    </nav>
  )
}

function MobileNavButton() {
  return (
    <DisclosureButton
      className="flex size-10 items-center justify-center self-center rounded-lg transition-colors hover:bg-gray-800 lg:hidden"
      aria-label="Open main menu"
    >
      <ListIcon className="size-6 text-gray-300" />
    </DisclosureButton>
  )
}

function MobileNav() {
  return (
    <DisclosurePanel className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-screen flex-col bg-gray-900/95 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <Link href="/" className="flex items-center">
            <Logo className="h-24 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <DisclosureButton
              className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800"
              aria-label="Close menu"
            >
              <XIcon className="size-6 text-gray-300" />
            </DisclosureButton>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <div className="space-y-1">
            {links.map(({ href, label, external }, linkIndex) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: linkIndex * 0.05,
                }}
                key={href}
              >
                <Link
                  href={href}
                  className="block rounded-lg px-4 py-3 text-xl font-semibold text-white transition-colors hover:bg-gray-800/50"
                  {...(external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8"
          >
            <div className="flex flex-col gap-3">
              <Button
                href={`${appUrl}/auth?q=login`}
                className="inline-flex w-full items-center justify-center rounded-sm border-2 border-teal-400 bg-transparent px-8 py-3 text-base font-semibold tracking-wide text-teal-400 uppercase transition-all hover:bg-teal-400 hover:text-gray-900"
              >
                LOGIN
              </Button>
              <Button
                href={`${appUrl}/auth?q=signup`}
                className="inline-flex w-full items-center justify-center rounded-sm bg-teal-400 px-10 py-3.5 text-base font-semibold tracking-wide text-gray-900 uppercase transition-all hover:bg-teal-500"
              >
                SIGNUP
              </Button>
            </div>
          </motion.div>
        </nav>

        <div className="border-t border-gray-800 px-6 py-4">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Bitsacco. All rights reserved.
          </p>
        </div>
      </div>
    </DisclosurePanel>
  )
}

export function Navbar({ banner }: { banner?: React.ReactNode }) {
  return (
    <Disclosure
      as="header"
      className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-xl"
    >
      <Container>
        <PlusGrid>
          <PlusGridRow className="relative flex justify-between">
            <div className="relative flex gap-6">
              <PlusGridItem className="py-3">
                <Link href="/" title="Home" className="flex items-center">
                  <Logo className="h-24 w-auto" />
                </Link>
              </PlusGridItem>
              {banner && (
                <div className="relative hidden items-center py-3 lg:flex">
                  {banner}
                </div>
              )}
            </div>
            <DesktopNav />
            <MobileNavButton />
          </PlusGridRow>
        </PlusGrid>
      </Container>
      <MobileNav />
    </Disclosure>
  )
}
