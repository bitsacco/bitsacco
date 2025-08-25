import Link from "next/link";
import { Button } from "@bitsacco/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-purple-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">Bitsacco</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Community Savings & Investment
            <span className="block text-orange-500">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join or create investment groups (Chamas), pool resources together,
            and grow your wealth through collective savings powered by Bitcoin
            and Lightning Network.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg">
                Start Saving Together
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Join Your Chama
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Community Savings
            </h3>
            <p className="text-gray-600">
              Join trusted groups and save money together with shared goals and
              accountability.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Instant transactions and settlements using Bitcoin&apos;s
              Lightning Network technology.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure & Transparent
            </h3>
            <p className="text-gray-600">
              Every transaction is secured by cryptography with full
              transparency for all members.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-purple-500 rounded-md"></div>
            <span className="text-lg font-bold">Bitsacco</span>
          </div>
          <p className="text-gray-400">
            Community savings and investment platform powered by Bitcoin.
          </p>
        </div>
      </footer>
    </div>
  );
}
