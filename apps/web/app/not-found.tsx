"use client";

import { Button, Container, Logo } from "@bitsacco/ui";
import { WhatsappLogoIcon, EnvelopeIcon } from "@phosphor-icons/react";

export default function NotFound() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+254708420214";
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bitsacco.com";
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900" />
      <Container className="relative z-10 max-w-lg px-6">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo className="h-16 w-auto" href="/" />
          </div>

          {/* 404 Error */}
          <div>
            <h1 className="text-8xl font-bold text-teal-400 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              We&apos;re sorry - the page you requested was not found.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              href="/"
              variant="tealPrimary"
              size="lg"
              fullWidth
              className="shadow-lg shadow-teal-500/20"
            >
              Go to Homepage
            </Button>
            <Button href="/dashboard" variant="tealOutline" size="lg" fullWidth>
              Go to Dashboard
            </Button>
          </div>

          {/* Support Options */}
          <div className="border-t border-slate-700 pt-6">
            <p className="text-sm text-gray-400 mb-4">
              Need help? Contact our support team:
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all"
                aria-label="Contact via WhatsApp"
              >
                <WhatsappLogoIcon size={20} weight="fill" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all"
                aria-label="Contact via Email"
              >
                <EnvelopeIcon size={20} weight="fill" />
                <span className="text-sm font-medium">Email</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
