export interface FAQ {
  question: string;
  answer: string;
  key: string;
}

export interface FAQStructuredDataProps {
  /**
   * Identifier used to find the correct json file
   * (The JSON file should live in /website/static/{faqsId}-faqs.json)
   */
  faqsId: string;
  /**
   * Whether or not to also return the text of the questions
   * (By default it will only return the JSON-LD object inside a script tag)
   */
  renderFaqs?: boolean;
}

export interface FAQStructuredData {
  '@context': string;
  '@type': string;
  'mainEntity': FAQQuestionStructuredData[];
}

export interface FAQQuestionStructuredData {
  '@type': 'Question';
  'name': string;
  'acceptedAnswer': {
    '@type': 'Answer';
    'text': string;
  };
}
