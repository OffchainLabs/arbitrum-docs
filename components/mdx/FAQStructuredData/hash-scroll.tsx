'use client';

import { useEffect, useRef } from 'react';

/**
 * Scrolls to the element named by the URL hash on mount, offset clear of the sticky header.
 *
 * Split out of `FAQStructuredData` so that component can stay a Server Component: React never
 * executes a `<script>` rendered inside a client component, so the JSON-LD it emits would be
 * dropped on client-side navigation (and warn in the console).
 */
export function FAQHashScroll() {
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && !scrolledRef.current) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 20,
          behavior: 'smooth',
        });
        scrolledRef.current = true;
      }
    }
  }, []);

  return null;
}
