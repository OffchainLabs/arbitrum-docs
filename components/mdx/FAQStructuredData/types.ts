export interface FAQ {
  question: string;
  answer: string;
  key: string;
}

/**
 * Every `faqsId` value used across `content/docs` (see `<FAQStructuredDataJsonLd faqsId="...">`)
 * must have a matching entry in this union and a matching `./data/<id>-faqs.json` file.
 * `scripts/faq-data-check.ts` enforces that pairing at test time; the component enforces it at
 * render time.
 */
export type FaqsId =
  'bridging' | 'building' | 'building-orbit' | 'building-stylus' | 'get-started' | 'node-running';

export interface FAQStructuredDataProps {
  faqsId: FaqsId;
  renderFaqs?: boolean;
}
