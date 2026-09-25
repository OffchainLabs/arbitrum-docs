import bridgingFaqs from './data/bridging-faqs.json';
import buildingFaqs from './data/building-faqs.json';
import buildingOrbitFaqs from './data/building-orbit-faqs.json';
import buildingStylusFaqs from './data/building-stylus-faqs.json';
import getStartedFaqs from './data/get-started-faqs.json';
import nodeRunningFaqs from './data/node-running-faqs.json';
import { FAQHashScroll } from './hash-scroll';
import type { FAQ, FAQStructuredDataProps, FaqsId } from './types';

// Explicit id-to-import map, not a dynamic `require`/`import` by template string: every entry is
// statically analyzable, so the bundler can tree-shake and TypeScript can enforce `FaqsId`
// exhaustiveness (see `Record<FaqsId, FAQ[]>` below).
const FAQ_MAP: Record<FaqsId, FAQ[]> = {
  'bridging': bridgingFaqs,
  'building': buildingFaqs,
  'building-orbit': buildingOrbitFaqs,
  'building-stylus': buildingStylusFaqs,
  'get-started': getStartedFaqs,
  'node-running': nodeRunningFaqs,
};

export default function FAQStructuredData({ faqsId, renderFaqs }: FAQStructuredDataProps) {
  const faqs = FAQ_MAP[faqsId];
  if (!faqs) {
    // MDX content is not type-checked against `FaqsId`, so a bad id can still reach here at
    // runtime. Fail loudly instead of silently rendering nothing (and no JSON-LD block).
    throw new Error(
      `FAQStructuredData: unknown faqsId="${faqsId}". Known ids: ${Object.keys(FAQ_MAP).join(', ')}.`,
    );
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
