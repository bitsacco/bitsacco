// Type for FAQs that have been validated to have non-null questions and answers
export type ValidFAQ = {
  _id: string
  question: string
  answer: string
  category:
    | 'general'
    | 'sacco'
    | 'chama'
    | 'bitcoin'
    | 'savings'
    | 'technical'
    | null
  order: number | null
}
