import React from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): JSX.Element {
  const location = useLocation();
  const { item, level } = props;

  // Only process root-level categories (level 0)
  if (level === 0 && item.type === 'category') {
    const params = new URLSearchParams(location.search);
    const expandTarget = params.get('sidebar_expand');

    if (expandTarget) {
      // Determine if this category should be expanded based on URL param
      const shouldExpand =
        (expandTarget === 'stylus' && item.label === 'Build apps with Stylus') ||
        (expandTarget === 'solidity' && item.label === 'Build apps with Solidity');

      // Override the item's collapsed property
      if (shouldExpand && item.collapsible) {
        const modifiedItem = {
          ...item,
          collapsed: false, // Force this category to be expanded
        };

        return <Category {...props} item={modifiedItem} />;
      }

      // For other categories at this level, force them to collapse if we're expanding a specific one
      if (item.collapsible && !shouldExpand) {
        const modifiedItem = {
          ...item,
          collapsed: true, // Force other categories to collapse
        };

        return <Category {...props} item={modifiedItem} />;
      }
    }
  }

  return <Category {...props} />;
}
