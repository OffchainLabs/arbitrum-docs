import React from 'react';
import OriginalNavbarItem from '@theme-original/NavbarItem';
import { useHistory } from '@docusaurus/router';

export default function NavbarItem(props) {
  const history = useHistory();

  // Check if this navbar item should control sidebar state
  if (props.sidebarExpand) {
    const enhancedProps = {
      ...props,
      onClick: (e) => {
        // Call original onClick if it exists
        if (props.onClick) {
          props.onClick(e);
        }

        // Don't add our custom behavior if the event was prevented
        if (e.defaultPrevented) {
          return;
        }

        // Add sidebar expansion parameter to URL
        e.preventDefault();
        const url = new URL(props.to, window.location.origin);
        url.searchParams.set('sidebar_expand', props.sidebarExpand);
        history.push(url.pathname + url.search);
      },
    };

    return <OriginalNavbarItem {...enhancedProps} />;
  }

  // For all other navbar items, use default behavior
  return <OriginalNavbarItem {...props} />;
}
