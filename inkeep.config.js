// Inkeep client module — auto-loaded by @inkeep/cxkit-docusaurus via getClientModules.
// Runs in the browser. Sets window.InkeepConfig so the onEvent function survives to the
// widget — functions attached to themeConfig.inkeep get stripped during Docusaurus's
// build-time JSON serialization, which is why PR #3308 didn't actually wire events.

if (typeof window !== 'undefined') {
  const handleInkeepEvent = (event) => {
    if (!window.posthog) return;

    const { eventName, properties } = event;

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

  window.InkeepConfig = {
    SearchBar: { baseSettings: { onEvent: handleInkeepEvent } },
    ChatButton: { baseSettings: { onEvent: handleInkeepEvent } },
  };
}
