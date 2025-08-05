import { Container } from '@/components/container'
import { Link } from '@/components/link'
import { Logo } from '@/components/logo'

type NavItem = {
  name: string
  href: string
  external?: boolean
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bitsacco.com'

const navigation: {
  products: NavItem[]
  company: NavItem[]
  developers: NavItem[]
  legal: NavItem[]
} = {
  products: [
    { name: 'Membership', href: `${appUrl}/membership`, external: true },
    { name: 'Personal Savings', href: `${appUrl}/personal`, external: true },
    { name: 'Chama Savings', href: `${appUrl}/chama`, external: true },
    { name: 'Loans', href: `${appUrl}/loans`, external: true },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Partners', href: '/partners' },
    { name: 'Media Kit', href: '/media' },
    { name: 'Contact', href: '/contact' },
  ],
  developers: [
    { name: 'Open Source', href: '/open-source' },
    { name: 'GitHub', href: 'https://github.com/bitsacco', external: true },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-gray-800 bg-gray-900">
      <Container>
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-8">
            <div className="mb-12 space-y-4 text-center lg:mb-0 lg:max-w-sm lg:text-left">
              <Logo className="mx-auto h-20 w-auto sm:h-24 lg:mx-0" />
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-400 lg:mx-0">
                Bitcoin-powered Savings and Credit Cooperative.
                <br />
                We build better money experiences for communities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4 sm:text-left lg:flex lg:gap-x-16 xl:gap-x-20">
              <div>
                <h3 className="mb-1 text-sm font-bold tracking-wider text-white uppercase">
                  Products
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.products.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-300 transition-colors hover:text-teal-400"
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
                <h3 className="mb-1 text-sm font-bold tracking-wider text-white uppercase">
                  Company
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-300 transition-colors hover:text-teal-400"
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
                <h3 className="mb-1 text-sm font-bold tracking-wider text-white uppercase">
                  Developers
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.developers.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-300 transition-colors hover:text-teal-400"
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
                <h3 className="mb-1 text-sm font-bold tracking-wider text-white uppercase">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-gray-300 transition-colors hover:text-teal-400"
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
          <div className="mt-12 border-t border-gray-800 pt-8 sm:mt-16">
            <p className="text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Bitsacco. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
