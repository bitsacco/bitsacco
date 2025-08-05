import { Link } from '@/components/link'
import * as Headless from '@headlessui/react'
import { clsx } from 'clsx'

const variants = {
  primary: clsx(
    'inline-flex items-center justify-center px-4 py-[calc(0.5rem-1px)]',
    'border border-transparent bg-black',
    'text-lg font-medium whitespace-nowrap text-[#F3EFE0] dark:bg-white dark:text-black',
    'data-disabled:bg-neutral-950 data-disabled:opacity-40 data-hover:bg-black',
    'dark:data-hover:bg-neutral-100',
  ),
  secondary: clsx(
    'inline-flex items-center justify-center px-4 py-[calc(0.5rem-1px)]',
    'border border-transparent bg-white',
    'text-lg font-medium whitespace-nowrap text-black dark:bg-neutral-800 dark:text-white',
    'data-disabled:bg-neutral-950 data-disabled:opacity-40 data-hover:bg-neutral-300',
    'dark:data-hover:bg-neutral-700',
  ),
  outline: clsx(
    'inline-flex items-center justify-center px-2 py-[calc(0.375rem-1px)]',
    'border border-transparent ring-1 ring-black/50 dark:ring-white/50',
    'text-sm font-medium whitespace-nowrap text-neutral-950 dark:text-white',
    'data-disabled:bg-transparent data-disabled:opacity-40 data-hover:bg-neutral-50 dark:data-hover:bg-neutral-800',
  ),
}

type ButtonProps = {
  variant?: keyof typeof variants
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (Headless.ButtonProps & { href?: undefined })
)

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  // If a custom className is provided, use it without the variant styles
  const baseClassName = clsx(variants[variant])

  if (typeof props.href === 'undefined') {
    // For Headless Button, className can be a string or function
    return <Headless.Button {...props} className={className || baseClassName} />
  }

  // For Link component, className must be a string
  const linkClassName =
    typeof className === 'string' ? className : baseClassName

  return <Link {...props} className={linkClassName} />
}
