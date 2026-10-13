import posthog from 'posthog-js';

type ChatEvent =
  'user_message_submitted' | 'assistant_message_received' | 'assistant_source_item_clicked';

/** Where the chat was used: the panel trigger, or the search dialog's Ask AI. */
export type ComponentType = 'ChatButton' | 'SearchBar';

/** Sends a chat event with the `inkeep_` names lib/inkeep.ts uses. Never pass message text. */
export function captureChatEvent(
  name: ChatEvent,
  properties: { component_type: ComponentType; source_link?: string },
): void {
  if (!posthog.__loaded) return;
  posthog.capture(`inkeep_${name}`, properties);
}
