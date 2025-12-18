import { Link } from '@/components/link'
import { Container, Logo } from '@bitsacco/ui'
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  WhatsappLogoIcon,
  XLogoIcon,
} from '@phosphor-icons/react/dist/ssr'

const NostrIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 3.314 1.612 6.25 4.1 8.08L8 16V8h2l4 6V8h2v8l1.9 4.08C20.388 18.25 22 15.314 22 12c0-5.523-4.477-10-10-10z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
)

type NavItem = {
  name: string
  href: string
  external?: boolean
}

type SocialLink = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  ariaLabel: string
}

const navigation: {
  community: NavItem[]
  resources: NavItem[]
  developers: NavItem[]
  legal: NavItem[]
} = {
  community: [
    { name: 'Guides', href: '/guides' },
    { name: 'Membership', href: '/membership' },
    { name: 'Personal Savings', href: '/personal-savings' },
    { name: 'Group Savings', href: '/group-savings' },
    { name: 'Loans & Credit', href: '/loans-credit' },
  ],
  resources: [
    { name: 'About', href: '/about' },
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

const socialLinks: SocialLink[] = [
  {
    name: 'Twitter',
    href: 'https://x.com/bitsacco',
    icon: XLogoIcon,
    ariaLabel: 'Twitter (X)',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/bitsacco',
    icon: LinkedinLogoIcon,
    ariaLabel: 'LinkedIn',
  },
  {
    name: 'Nostr',
    href: 'https://nosta.me/npub1rvdxxzr3xsk0csqalfscjgsxs40lcryucggkjn4ev9d5xg7k4j0sqn85vc',
    icon: NostrIcon,
    ariaLabel: 'Nostr',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/bitsacco',
    icon: GithubLogoIcon,
    ariaLabel: 'GitHub',
  },
  {
    name: 'WhatsApp',
    href: 'https://chat.whatsapp.com/KMXM3gagZOJEmYpoel5PrQ',
    icon: WhatsappLogoIcon,
    ariaLabel: 'WhatsApp Community',
  },
]

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
              <div className="flex justify-center gap-4 lg:justify-start">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 transition-colors hover:text-teal-500"
                      aria-label={social.ariaLabel}
                    >
                      <Icon className="h-6 w-6" />
                    </a>
                  )
                })}
              </div>
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
