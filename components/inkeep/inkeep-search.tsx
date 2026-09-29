'use client';

import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { inkeepAiChatSettings, inkeepSearchSettings, useInkeepBaseSettings } from '@/lib/inkeep';

// The Inkeep widget bundle is large, so it loads only in the browser. Fumadocs mounts this dialog on
// the first render of every page (its `preload` default), so the gate in the component below, not
// this `dynamic()`, is what defers the chunk until a reader first opens search.
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
  // Latches on the first open and stays set, so closing keeps the widget mounted with its state.
  // Set during render (React's "storing information from previous renders" pattern) rather than in
  // an effect, so the first open renders the widget in the same pass.
  const [hasOpened, setHasOpened] = useState(open);
  if (open && !hasOpened) setHasOpened(true);

  if (!hasOpened) return null;

  return (
    <InkeepModalSearchAndChat
      baseSettings={baseSettings}
      aiChatSettings={inkeepAiChatSettings}
      searchSettings={inkeepSearchSettings}
      modalSettings={{ isOpen: open, onOpenChange, shortcutKey: null }}
    />
  );
}
