import { getFAQs } from '@/sanity/queries'
import type { ValidFAQ } from '@/types/faq'
import { Container } from '@bitsacco/ui'
import { FAQClient } from './faq-client'
import { Heading, Subheading } from './text'

export async function FAQSection() {
  const faqs = await getFAQs()

  if (!faqs || faqs.length === 0) {
    return null
  }

  // Filter out FAQs with missing required fields
  const validFaqs = faqs.filter(
    (faq): faq is ValidFAQ => faq.question !== null && faq.answer !== null,
  )

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 via-transparent to-slate-900/20" />
      <Container className="relative">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Subheading className="mb-4 text-lg font-semibold tracking-wider text-teal-500">
            LEARN MORE ABOUT BITSACCO
          </Subheading>
          <Heading
            as="h2"
            className="text-4xl font-medium tracking-tight text-white"
          >
            Frequently Asked Questions
          </Heading>
          <p className="mt-4 text-lg text-slate-400">
            Learn more about how Bitsacco empowers communities through Bitcoin
            financial education and tools. Have a question not listed here?{' '}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@bitsacco.com'}`}
              className="text-teal-500 hover:text-teal-400"
            >
              Contact us
            </a>
          </p>
        </div>

        <FAQClient faqs={validFaqs} />
      </Container>
    </section>
  )
}
