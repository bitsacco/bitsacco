import { Button } from '@/components/button'
import { Container } from '@/components/container'
import type { Metadata } from 'next'

const title = 'Page Not Found'
const description =
  'Sorry, we could not find the page you are looking for. Perhaps you have mistyped the URL? Be sure to check your spelling.'

export const metadata: Metadata = {
  title: `${title}`,
  description: `${description}`,
  openGraph: {
    title: `${title}`,
  },
}

export default function ErrorPage() {
  return (
    <main className="overflow-hidden dark:bg-gradient-to-b dark:from-gray-950 dark:via-black dark:to-gray-900">
      <div className="error-area flex items-center justify-center bg-white py-48 sm:py-36 dark:bg-transparent">
        <Container className="mx-auto mt-26 max-w-screen-2xl px-6 md:px-4 lg:px-10 xl:px-28">
          <div className="error-content text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Page Not Found!
            </h1>
            <p className="my-5 max-w-lg text-black dark:text-gray-300">
              We&apos;re sorry - the page you requested was not found.
            </p>
            <Button className="w-auto" href="/">
              Home
            </Button>
          </div>
        </Container>
      </div>
    </main>
  )
}
