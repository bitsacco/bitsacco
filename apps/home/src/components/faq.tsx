import { getFAQs } from '@/sanity/queries'
import { Container } from './container'
import { FAQClient } from './faq-client'
import { Heading, Subheading } from './text'

export async function FAQSection() {
  const faqs = await getFAQs()

  if (!faqs || faqs.length === 0) {
    return null
  }

  // Filter out FAQs with missing required fields
  const validFaqs = faqs.filter(
    (
      faq,
    ): faq is {
      _id: string
      question: string
      answer: string
      category: string
      order: number
    } => faq.question !== null && faq.answer !== null,
  )

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-teal-950/10" />
      <Container className="relative">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Subheading className="mb-4 text-lg font-semibold tracking-wider text-teal-400">
            LEARN MORE ABOUT BITSACCO
          </Subheading>
          <Heading
            as="h2"
            className="text-4xl font-medium tracking-tight text-white"
          >
            Frequently Asked Questions
          </Heading>
          <p className="mt-4 text-lg text-gray-400">
            These are the most frequently asked questions about Bitsacco and
            related topics. Have a query not listed here, please{' '}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@bitsacco.com'}`}
              className="text-teal-400 hover:text-teal-300"
            >
              contact us
            </a>
          </p>
        </div>

        <FAQClient faqs={validFaqs} />
      </Container>
    </section>
  )
}
