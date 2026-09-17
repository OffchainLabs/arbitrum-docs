import type {
  InkeepAIChatSettings,
  InkeepBaseSettings,
  InkeepCallbackEvent,
  InkeepSearchSettings,
} from '@inkeep/cxkit-react';

// Shared Inkeep configuration, ported from the Docusaurus instance
// (arbitrum-docs/inkeep.js + inkeep.config.js). Consumed by the client
// components in components/inkeep/. Type-only imports keep this module
// safe to import from server components.

// PostHog analytics bridge, mirroring inkeep.config.js. No-op until PostHog
// is wired into this app (window.posthog is undefined), so it carries zero
// runtime cost today while preserving parity with Docusaurus.
type PostHogClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

const trackedEvents = [
  // Chat events
  'assistant_message_received',
  'user_message_submitted',
  'assistant_positive_feedback_submitted',
  'assistant_negative_feedback_submitted',
  'assistant_source_item_clicked',
  'chat_share_button_clicked',
  // Search events
  'search_query_submitted',
  'search_result_clicked',
  'search_query_response_received',
];

function handleInkeepEvent(event: InkeepCallbackEvent): void {
  if (typeof window === 'undefined') return;
  const posthog = (window as unknown as { posthog?: PostHogClient }).posthog;
  if (!posthog) return;

  const { eventName } = event;
  if (!trackedEvents.includes(eventName)) return;

  const properties = (event.properties ?? {}) as unknown as Record<string, unknown>;
  const eventProperties: Record<string, unknown> = {
    component_type: properties.componentType,
    widget_version: properties.widgetLibraryVersion,
  };

  if (eventName.includes('search')) {
    eventProperties.search_query = properties.searchQuery;
    if (properties.totalResults !== undefined) {
      eventProperties.total_results = properties.totalResults;
    }
    if (properties.title) {
      eventProperties.result_title = properties.title;
    }
  }

  if (eventName.includes('feedback')) {
    eventProperties.feedback_reasons = properties.reasons;
  }

  if (eventName === 'assistant_source_item_clicked') {
    eventProperties.source_link = properties.link;
  }

  posthog.capture(`inkeep_${eventName}`, eventProperties);
}

export const inkeepBaseSettings: InkeepBaseSettings = {
  apiKey: process.env.NEXT_PUBLIC_INKEEP_API_KEY,
  primaryBrandColor: '#213147',
  organizationDisplayName: 'Arbitrum',
  onEvent: handleInkeepEvent,
};

export const inkeepAiChatSettings: InkeepAIChatSettings = {
  aiAssistantName: 'Arbitrum Assistant',
  aiAssistantAvatar: '/img/logo.svg',
  exampleQuestions: [
    'How to estimate gas in Arbitrum?',
    'What is the difference between Arbitrum One and Nova?',
    'How to deploy a smart contract on Arbitrum?',
    'What are Arbitrum Orbit chains?',
    'How does Arbitrum handle L1 to L2 messaging?',
    'What is Arbitrum Stylus?',
  ],
  introMessage:
    "Hi! I'm here to help you navigate Arbitrum documentation. Ask me anything about building on Arbitrum, deploying contracts, or understanding our technology.",
};

export const inkeepSearchSettings: InkeepSearchSettings = {
  placeholder: 'Search documentation...',
  defaultQuery: '',
  maxResults: 40,
  debounceTimeMs: 300,
  shouldOpenLinksInNewTab: true,
};
