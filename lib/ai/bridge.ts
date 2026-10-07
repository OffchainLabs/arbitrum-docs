type Listener = (prompt: string) => void;

const listeners = new Set<Listener>();

/** Subscribes the chat panel to "Ask AI" requests from outside it; returns the unsubscribe. */
export function onAskAI(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function askAI(prompt: string): void {
  for (const listener of listeners) listener(prompt);
}

export function canAskAI(): boolean {
  return listeners.size > 0;
}
