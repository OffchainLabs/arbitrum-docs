/**
 * @typedef { import('./types').FAQStructuredDataProps } FAQStructuredDataProps
 * @typedef { import('./types').FAQStructuredData } FAQStructuredData
 */

import React from 'react';

/**
 * A component that renders a FAQ structured data and markdown entries
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 * @param {FAQStructuredDataProps} props
 * @returns
 */
export default function FAQStructuredData(props) {
  const faqs = require(`./../../../static/${props.faqsId}-faqs.json`);

  /** @type {FAQStructuredData} */
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
  console.log(faqStructuredData);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      {faqs.map((faq) => (
        <div className='faq-question'>
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
