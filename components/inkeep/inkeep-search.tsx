'use client';

import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import dynamic from 'next/dynamic';

import { inkeepAiChatSettings, inkeepBaseSettings, inkeepSearchSettings } from '@/lib/inkeep';

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
  return (
    <InkeepModalSearchAndChat
      baseSettings={inkeepBaseSettings}
      aiChatSettings={inkeepAiChatSettings}
      searchSettings={inkeepSearchSettings}
      modalSettings={{ isOpen: open, onOpenChange, shortcutKey: null }}
    />
  );
}
