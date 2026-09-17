'use client';

import dynamic from 'next/dynamic';

import { inkeepAiChatSettings, inkeepBaseSettings } from '@/lib/inkeep';

// Floating "Ask AI" button, mirroring the Docusaurus ChatButton. Browser-only
// so the widget bundle stays out of the server render path.
const ChatButton = dynamic(() => import('@inkeep/cxkit-react').then((m) => m.InkeepChatButton), {
  ssr: false,
});

export function InkeepChatButton() {
  return <ChatButton baseSettings={inkeepBaseSettings} aiChatSettings={inkeepAiChatSettings} />;
}
