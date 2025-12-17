import { Link } from '@/components/link'
import { Container, Logo } from '@bitsacco/ui'

type NavItem = {
  name: string
  href: string
  external?: boolean
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bitsacco.com'

const navigation: {
  community: NavItem[]
  resources: NavItem[]
  developers: NavItem[]
  legal: NavItem[]
} = {
  community: [
    { name: 'About', href: '/community' },
    { name: 'Membership', href: `${appUrl}/membership`, external: true },
    { name: 'Personal Savings', href: `${appUrl}/personal`, external: true },
    { name: 'Chama Savings', href: `${appUrl}/chama`, external: true },
    { name: 'Loans', href: `${appUrl}/loans`, external: true },
  ],
  resources: [
    { name: 'Guides', href: '/guides' },
    { name: 'Blog', href: '/blog' },
    { name: 'Partners', href: '/partners' },
    { name: 'Media Kit', href: '/media' },
    { name: 'Contact', href: '/contact' },
  ],
  developers: [
    { name: 'Open Source', href: '/open-source' },
    { name: 'Fedimint Protocol', href: '/fedimint-protocol' },
    { name: 'Mini Apps', href: '/mini-apps' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-slate-700 bg-slate-900">
      <Container>
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-8">
            <div className="mb-12 space-y-4 text-center lg:mb-0 lg:max-w-sm lg:text-left">
              <Logo className="h-18 w-auto" />
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400 lg:mx-0">
                Empowering communities through Bitcoin financial education and
                tooling.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4 sm:text-left lg:flex lg:gap-x-16 xl:gap-x-20">
              <div>
                <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-white">
                  Community
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.community.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-300 transition-colors hover:text-teal-500"
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-white">
                  Resources
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-300 transition-colors hover:text-teal-500"
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-white">
                  Developers
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.developers.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-300 transition-colors hover:text-teal-500"
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-white">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-300 transition-colors hover:text-teal-500"
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-700 pt-8 sm:mt-16">
            <p className="text-center text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Bitsacco. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
