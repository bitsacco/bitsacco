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
  tealPrimary: clsx(
    'inline-flex items-center justify-center rounded-md px-12 py-3',
    'bg-teal-500 text-white',
    'text-base font-semibold tracking-wide whitespace-nowrap uppercase',
    'transition-all hover:bg-teal-400',
    'disabled:cursor-not-allowed disabled:bg-teal-300 disabled:opacity-50',
    'focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none',
  ),
  tealOutline: clsx(
    'inline-flex items-center justify-center rounded-md px-12 py-3',
    'border-2 border-teal-500 bg-transparent text-teal-500',
    'text-base font-semibold tracking-wide whitespace-nowrap uppercase',
    'transition-all hover:bg-teal-500/10',
    'disabled:cursor-not-allowed disabled:border-teal-300 disabled:text-teal-300 disabled:opacity-50',
    'focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none',
  ),
  tealSubmit: clsx(
    'w-full rounded-md bg-teal-600 px-4 py-2 text-white',
    'hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
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
