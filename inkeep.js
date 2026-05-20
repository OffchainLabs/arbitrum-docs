// Shared Inkeep configuration

// Forwards analytics events from the Inkeep widget into PostHog.
// Called once per event fired by @inkeep/cxkit-docusaurus.
const handleInkeepEvent = (event) => {
  // Only run on client where PostHog is available
  if (typeof window === 'undefined' || !window.posthog) {
    return;
  }

  const { eventName, properties } = event;

  // Events we want to track in PostHog
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

  if (!trackedEvents.includes(eventName)) return;

  // Extract relevant properties to avoid sending excessive data
  const eventProperties = {
    component_type: properties?.componentType,
    widget_version: properties?.widgetLibraryVersion,
  };

  if (eventName.includes('search')) {
    eventProperties.search_query = properties?.searchQuery;
    if (properties?.totalResults !== undefined) {
      eventProperties.total_results = properties.totalResults;
    }
    if (properties?.title) {
      eventProperties.result_title = properties.title;
    }
  }

  if (eventName.includes('feedback')) {
    eventProperties.feedback_reasons = properties?.reasons;
  }

  if (eventName === 'assistant_source_item_clicked') {
    eventProperties.source_link = properties?.link;
  }

  window.posthog.capture(`inkeep_${eventName}`, eventProperties);
};

const inkeepBaseSettings = {
  apiKey: process.env.INKEEP_API_KEY,
  primaryBrandColor: '#213147',
  organizationDisplayName: 'Arbitrum',
  onEvent: handleInkeepEvent,
  theme: {
    syntaxHighlighter: {
      lightTheme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/palenight'),
    },
  },
};

const inkeepModalSettings = {
  placeholder: 'Search documentation...',
  defaultQuery: '',
  maxResults: 40,
  debounceTimeMs: 300,
  shouldOpenLinksInNewTab: true,
};

const inkeepExampleQuestions = [
  'How to estimate gas in Arbitrum?',
  'What is the difference between Arbitrum One and Nova?',
  'How to deploy a smart contract on Arbitrum?',
  'What are Arbitrum Orbit chains?',
  'How does Arbitrum handle L1 to L2 messaging?',
  'What is Arbitrum Stylus?',
];

module.exports = { inkeepBaseSettings, inkeepModalSettings, inkeepExampleQuestions };
