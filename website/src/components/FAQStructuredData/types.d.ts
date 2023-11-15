export interface FAQ {
  question: string;
  answer: string;
  key: string;
}

export interface FAQStructuredDataProps {
  faqs: FAQ[];
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
