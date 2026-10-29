'use client';

import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { askAI, canAskAI } from '@/lib/ai/bridge';
import { inkeepAiChatSettings, inkeepSearchSettings, useInkeepBaseSettings } from '@/lib/inkeep';

// The Inkeep widget bundle is large; load it only in the browser and only once
// the dialog is first opened by Fumadocs.
const InkeepModalSearchAndChat = dynamic(
  () => import('@inkeep/cxkit-react').then((m) => m.InkeepModalSearchAndChat),
  { ssr: false },
);

/**
 * Fumadocs SearchDialog replacement backed by Inkeep's combined search + AI chat
 * modal. Wired into RootProvider via `search.SearchDialog`; Fumadocs owns the
 * open state (and the Cmd/Ctrl+K hotkey), so Inkeep's own shortcut is disabled.
 */
export default function InkeepSearchDialog({ open, onOpenChange }: SharedProps) {
  const baseSettings = useInkeepBaseSettings();
  // cxkit sets its own view to 'chat' after `onToggleView`; a new key remounts it in search view.
  const [mount, setMount] = useState(0);
  const panel = canAskAI();

  return (
    <InkeepModalSearchAndChat
      key={mount}
      baseSettings={baseSettings}
      aiChatSettings={inkeepAiChatSettings}
      searchSettings={inkeepSearchSettings}
      modalSettings={{ isOpen: open, onOpenChange, shortcutKey: null }}
      // With the AI chat panel mounted, "Ask AI" closes this dialog and opens the panel with the query.
      // `onToggleView` is cxkit's WidgetView callback (@inkeep/cxkit-types OnToggleView).
      // The Ask AI card submits to cxkit's own chat before `onToggleView` runs, so hide it.
      shouldShowAskAICard={!panel}
      onToggleView={({ view, query }) => {
        if (view !== 'chat' || !canAskAI()) return;
        onOpenChange(false);
        setMount((n) => n + 1);
        askAI(query ?? '');
      }}
    />
  );
}
