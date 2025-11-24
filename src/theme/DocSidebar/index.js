import React, { useEffect } from 'react';
import OriginalDocSidebar from '@theme-original/DocSidebar';
import { useLocation } from '@docusaurus/router';

export default function DocSidebar(props) {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a sidebar_expand parameter in the URL
    const params = new URLSearchParams(location.search);
    const expandTarget = params.get('sidebar_expand');

    if (expandTarget) {
      // Use a small delay to ensure sidebar has rendered
      const timeoutId = setTimeout(() => {
        // Find the sidebar category elements by their text content
        const categories = document.querySelectorAll('.theme-doc-sidebar-item-category');

        let solidityCategory = null;
        let stylusCategory = null;

        categories.forEach((category) => {
          const label = category.querySelector('.menu__link--sublist');
          if (label) {
            const text = label.textContent.trim();
            if (text === 'Build apps with Solidity') {
              solidityCategory = category;
            } else if (text === 'Build apps with Stylus') {
              stylusCategory = category;
            }
          }
        });

        if (expandTarget === 'stylus' && stylusCategory) {
          // Expand Stylus, collapse Solidity
          const stylusButton = stylusCategory.querySelector('button.menu__link--sublist');
          const solidityButton = solidityCategory?.querySelector('button.menu__link--sublist');

          if (stylusButton && stylusButton.getAttribute('aria-expanded') === 'false') {
            stylusButton.click();
          }
          if (solidityButton && solidityButton.getAttribute('aria-expanded') === 'true') {
            solidityButton.click();
          }
        } else if (expandTarget === 'solidity' && solidityCategory) {
          // Expand Solidity, collapse Stylus
          const solidityButton = solidityCategory.querySelector('button.menu__link--sublist');
          const stylusButton = stylusCategory?.querySelector('button.menu__link--sublist');

          if (solidityButton && solidityButton.getAttribute('aria-expanded') === 'false') {
            solidityButton.click();
          }
          if (stylusButton && stylusButton.getAttribute('aria-expanded') === 'true') {
            stylusButton.click();
          }
        }

        // Clean up URL by removing the parameter after processing
        if (window.history.replaceState) {
          const cleanUrl = new URL(window.location);
          cleanUrl.searchParams.delete('sidebar_expand');
          window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [location]);

  return <OriginalDocSidebar {...props} />;
}
