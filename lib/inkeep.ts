'use client';

import type {
  InkeepAIChatSettings,
  InkeepBaseSettings,
  InkeepCallbackEvent,
  InkeepSearchSettings,
} from '@inkeep/cxkit-react';
import type { PostHog } from 'posthog-js';
import { usePostHog } from 'posthog-js/react';
import { useMemo } from 'react';

// Shared Inkeep configuration, ported from the Docusaurus instance
// (arbitrum-docs/inkeep.js + inkeep.config.js).

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

function handleInkeepEvent(event: InkeepCallbackEvent, posthog: PostHog): void {
  if (!posthog.__loaded) return;

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

const baseSettings = {
  apiKey: process.env.NEXT_PUBLIC_INKEEP_API_KEY,
  primaryBrandColor: '#213147',
  organizationDisplayName: 'Arbitrum',
  // Keep Inkeep's visitor ID in memory and its functional state in sessionStorage.
  // Both options are required by cxkit-primitives: they control separate storage paths.
  privacyPreferences: { optOutAnalyticalCookies: true, optOutFunctionalCookies: true },
};

export function useInkeepBaseSettings(): InkeepBaseSettings {
  const posthog = usePostHog();

  return useMemo(
    () => ({ ...baseSettings, onEvent: (event) => handleInkeepEvent(event, posthog) }),
    [posthog],
  );
}

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
