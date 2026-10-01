'use client';

import { useEffect, useRef } from 'react';

/** Keep a mounted, inactive Radix panel searchable without leaving its contents visible. */
export function useFindablePanel(inactiveState: 'closed' | 'inactive') {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;

    const syncHidden = () => {
      if (panel.dataset.state === inactiveState) panel.setAttribute('hidden', 'until-found');
      else panel.removeAttribute('hidden');
    };
    const reveal = () => {
      if (panel.dataset.state !== inactiveState) return;
      const triggerId = panel.getAttribute('aria-labelledby');
      const trigger = triggerId ? document.getElementById(triggerId) : null;
      if (inactiveState === 'inactive') {
        // Radix Tabs selects on left-button mousedown, not click. Keep focus on the Find UI.
        trigger?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
      } else {
        trigger?.click();
      }
    };

    syncHidden();
    const observer = new MutationObserver(syncHidden);
    observer.observe(panel, { attributes: true, attributeFilter: ['data-state'] });
    panel.addEventListener('beforematch', reveal);
    return () => {
      observer.disconnect();
      panel.removeEventListener('beforematch', reveal);
    };
  }, [inactiveState]);

  return ref;
}
