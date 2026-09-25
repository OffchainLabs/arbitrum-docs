import buildingOrbitFaqs from './data/building-orbit-faqs.json';
import { FAQHashScroll } from './hash-scroll';
import type { FAQ, FAQStructuredDataProps } from './types';

const FAQ_MAP: Record<string, FAQ[]> = {
  'building-orbit': buildingOrbitFaqs,
};

export default function FAQStructuredData({ faqsId, renderFaqs }: FAQStructuredDataProps) {
  const faqs = FAQ_MAP[faqsId];
  if (!faqs) {
    console.warn(`FAQStructuredData: unknown faqsId="${faqsId}"`);
    return null;
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'name': 'FAQs for ' + faqsId,
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer },
    })),
  };

  return (
    <>
      <FAQHashScroll />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {renderFaqs &&
        faqs.map((faq) => (
          <div data-search-children className="faq-question" key={faq.key} id={faq.key}>
            <h3>
              {faq.question}
              <a className="hash-link" href={'#' + faq.key}></a>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
          </div>
        ))}
    </>
  );
}
