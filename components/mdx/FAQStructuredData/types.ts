export interface FAQ {
  question: string;
  answer: string;
  key: string;
}

export interface FAQStructuredDataProps {
  faqsId: string;
  renderFaqs?: boolean;
}
