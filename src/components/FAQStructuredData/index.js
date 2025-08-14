/**
 * Type definitions for the FAQStructuredData component
 * @typedef { import('./types').FAQStructuredDataProps } FAQStructuredDataProps - Props for the FAQStructuredData component
 * @typedef { import('./types').FAQStructuredData } FAQStructuredData - Schema.org structured data format for FAQs
 * @typedef { import('./types').FAQ } FAQ - Individual FAQ item with question, answer and key
 */

import React from 'react';
import { useLocation } from '@docusaurus/router';

/**
 * A component that generates and renders Schema.org FAQ structured data for SEO
 * and optionally displays the FAQ content on the page
 *
 * This component serves two primary purposes:
 * 1. Generates JSON-LD structured data for search engines to recognize FAQ content
 * 2. Optionally renders the FAQ questions and answers as visible HTML content
 *
 * The component automatically handles anchor links/fragment navigation when FAQs are rendered,
 * ensuring that direct links to specific questions work even with asynchronous loading.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 * @param {FAQStructuredDataProps} props - Component properties
 * @param {string} props.faqsId - ID used to locate the JSON file containing FAQ data
 * @param {boolean} [props.renderFaqs] - Whether to display the FAQ content visibly on the page
 * @returns {JSX.Element} React component with structured data and optional FAQ content
 */
export default function FAQStructuredData(props) {
  /**
   * Handle direct navigation to FAQ items via URL fragments/anchors
   *
   * This is necessary because this component is rendered asynchronously.
   * When a URL with a fragment is accessed (e.g., /page#faq-item-1), React won't be able to
   * scroll to the target element because it doesn't exist when the page initially loads.
   * This effect handles scrolling to the correct FAQ item once the component is mounted.
   */
  const scrolledRef = React.useRef(false); // Track if we've already scrolled to prevent infinite scrolling
  const { hash } = useLocation(); // Get the URL fragment/hash from React Router

  React.useEffect(() => {
    // Only run if we have a hash/fragment and haven't already scrolled
    if (hash && !scrolledRef.current) {
      const id = hash.replace('#', ''); // Remove # prefix from the hash
      const element = document.getElementById(id); // Find the target element

      if (element) {
        // Calculate position and scroll, with a small offset to avoid header overlap
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 20,
          behavior: 'smooth',
        });
        scrolledRef.current = true; // Mark that we've completed the scroll
      }
    }
  });

  /**
   * Load FAQ data from the static JSON file
   * The file path is constructed using the faqsId prop: /static/{faqsId}-faqs.json
   */
  const faqs = require(`./../../../static/${props.faqsId}-faqs.json`);

  /**
   * Create the Schema.org structured data object for FAQPage
   * This follows the official Schema.org specification for FAQPage type
   * @type {FAQStructuredData}
   * @see https://schema.org/FAQPage
   */
  const faqStructuredData = {
    '@context': 'https://schema.org', // Specify Schema.org context
    '@type': 'FAQPage', // Define this as a FAQ page
    'name': 'FAQs for ' + props.faqsId, // Name/title of the FAQ section
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question', // Each question is a Question entity
      'name': faq.question, // The question text
      'acceptedAnswer': {
        '@type': 'Answer', // With an Answer entity
        'text': faq.answer, // The answer text/HTML
      },
    })),
  };

  return (
    <>
      {/* 
        Render the structured data as a JSON-LD script
        This is invisible to users but provides structured data for search engines
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      {/* 
        Conditionally render the visible FAQ items if renderFaqs is true
        Each FAQ is rendered as a question with an anchor link and answer
      */}
      {props.renderFaqs &&
        faqs.map((faq) => (
          <div
            data-search-children // Enable search indexing for child elements
            className="faq-question"
            key={faq.key}
            id={faq.key} // ID used for direct linking to this question
          >
            <h3>
              {faq.question}
              {/* Hash link allows direct linking to this specific question */}
              <a className="hash-link" href={'#' + faq.key}></a>
            </h3>
            {/* 
              Render the answer as HTML
              Note: This uses dangerouslySetInnerHTML which should be used carefully
              The FAQ content should be sanitized before storing in the JSON file
            */}
            <div dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
          </div>
        ))}
    </>
  );
}
