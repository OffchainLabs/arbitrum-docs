// FAQ Structured Data component for SEO
import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs?: FAQItem[];
  children?: React.ReactNode;
}

export default function FAQStructuredDataJsonLd({ faqs = [], children }: FAQStructuredDataProps) {
  // For now, just render a simple div - can be enhanced later with actual structured data
  return (
    <div className="faq-structured-data">
      {children}
    </div>
  );
}