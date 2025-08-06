'use client'

import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'
import { EnvelopeSimpleIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { useState } from 'react'

export default function ContactPage() {
  const supportNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ''
  const [showEmailForm, setShowEmailForm] = useState(!supportNumber) // Show form by default if no WhatsApp
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Hidden field to catch bots
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message. We will get back to you soon!',
        })
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          honeypot: '',
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: 'Something went wrong. Please try again later.',
        })
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <Heading className="dark:text-neutral-0 text-neutral-950" as="h1">
                Contact Us
              </Heading>
              <Lead className="mx-auto mt-8 max-w-xl text-neutral-600 dark:text-neutral-400">
                Have questions about Bitsacco? We&apos;d love to hear from you.
                {supportNumber
                  ? ` Choose your preferred contact method below.`
                  : ` Send us a message and we'll respond as soon as possible.`}
              </Lead>
            </div>

            {/* Contact Method Options - Show grid only if WhatsApp is configured */}
            {supportNumber ? (
              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className={`group rounded-lg border p-6 text-center transition-colors ${
                    showEmailForm
                      ? 'border-teal-500 bg-teal-50 dark:border-teal-500 dark:bg-teal-900/20'
                      : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50 dark:border-gray-700 dark:hover:border-teal-500 dark:hover:bg-teal-900/20'
                  }`}
                >
                  <EnvelopeSimpleIcon className="mx-auto mb-4 h-12 w-12 text-teal-600 transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Email
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fill out the form below and we&apos;ll get back to you soon
                  </p>
                </button>

                <a
                  href={`https://wa.me/${supportNumber}?text=${encodeURIComponent('Hi, I have a question about Bitsacco.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-gray-200 p-6 text-center transition-colors hover:border-teal-500 hover:bg-teal-50 dark:border-gray-700 dark:hover:border-teal-500 dark:hover:bg-teal-900/20"
                >
                  <WhatsappLogoIcon className="mx-auto mb-4 h-12 w-12 text-teal-600 transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    WhatsApp
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send us a message on WhatsApp for quick responses
                  </p>
                </a>
              </div>
            ) : null}

            {/* Email Form - Show when no WhatsApp or when email option is clicked */}
            {showEmailForm && (
              <>
                {supportNumber && (
                  <div className="mb-4 border-t pt-8 dark:border-gray-700">
                    <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                      Send us an email
                    </h2>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    className="sr-only"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {submitStatus.type && (
                    <div
                      className={`rounded-md p-4 ${
                        submitStatus.type === 'success'
                          ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
                          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </Container>
        <Footer />
      </main>
    </>
  )
}
