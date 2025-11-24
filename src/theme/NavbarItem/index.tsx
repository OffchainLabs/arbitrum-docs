import React from 'react';
import OriginalNavbarItem from '@theme-original/NavbarItem';
import { useHistory } from '@docusaurus/router';
import type { Props } from '@theme/NavbarItem';

export default function NavbarItem(props: Props): JSX.Element {
  const history = useHistory();

  // Check if this navbar item should control sidebar state
  if ('sidebarExpand' in props && props.sidebarExpand) {
    const enhancedProps = {
      ...props,
      onClick: (e: React.MouseEvent) => {
        // Call original onClick if it exists
        if (props.onClick) {
          props.onClick(e);
        }

        // Don't add our custom behavior if the event was prevented
        if (e.defaultPrevented) {
          return;
        }

        // Add sidebar expansion parameter to URL
        if ('to' in props && props.to) {
          e.preventDefault();
          const url = new URL(props.to as string, window.location.origin);
          url.searchParams.set('sidebar_expand', props.sidebarExpand as string);
          history.push(url.pathname + url.search);
        }
      },
    };

    return <OriginalNavbarItem {...enhancedProps} />;
  }

  // For all other navbar items, use default behavior
  return <OriginalNavbarItem {...props} />;
}
