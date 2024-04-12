/**
 * @typedef { import('./types').FAQStructuredDataProps } FAQStructuredDataProps
 * @typedef { import('./types').FAQStructuredData } FAQStructuredData
 */

import React from 'react';
import { useLocation } from '@docusaurus/router';

/**
 * A component that renders a FAQ structured data and markdown entries
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 * @param {FAQStructuredDataProps} props
 * @returns
 */
export default function FAQStructuredData(props) {
  // This component is rendered asynchronously
  // If the accessed URL for a page that calls this component contains an anchor, React won't be able to
  // scroll into the right element, because it doesn't exist at the beginning.
  // We use this piece of code to trigger the scrolling action when the component is fully loaded
  const scrolledRef = React.useRef(false);
  const { hash } = useLocation();
  React.useEffect(() => {
    if (hash && !scrolledRef.current) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 20 });
        scrolledRef.current = true;
      }
    }
  });

  // Loading the FAQs
  const faqs = require(`./../../../static/${props.faqsId}-faqs.json`);

  // Creating the Structured Data object
  /** @type {FAQStructuredData} */
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'name': 'FAQs for ' + props.faqsId,
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };

  // Rendering the ld+json script and the actual FAQ in HTML
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      {props.renderFaqs &&
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
