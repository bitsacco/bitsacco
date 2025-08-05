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
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/partners' },
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
        <div className="py-20">
          <div className="lg:grid lg:grid-cols-5 lg:gap-16">
            <div className="space-y-6 lg:col-span-2">
              <Logo className="h-24 w-auto" />
              <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                Bitcoin-powered Savings and Credit Cooperative.
                <br />
                We build better money experiences for communities.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-4 gap-8 lg:col-span-3 lg:mt-0">
              <div className="text-center">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Products
                </h3>
                <ul role="list" className="mt-6 space-y-4">
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
              <div className="text-center">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
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
              <div className="text-center">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Developers
                </h3>
                <ul role="list" className="mt-6 space-y-4">
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
              <div className="text-center">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
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
          <div className="mt-16 border-t border-gray-800 pt-8">
            <p className="text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Bitsacco. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
