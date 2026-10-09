'use client';

import { useTranslations } from '@fuma-translate/react';
import { MessageCircleIcon } from 'lucide-react';
import {
  type ReactNode,
  createContext,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import { buttonVariants } from '@/components/ui/button';
import { onAskAI } from '@/lib/ai/bridge';
import { cn } from '@/lib/cn';

interface PendingPrompt {
  id: number;
  text: string;
}

// separate from the chat, so layouts reading `open` skip the updates of a streaming answer
const OpenContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);
const PendingContext = createContext<{
  prompt: PendingPrompt | undefined;
  clear: (id: number) => void;
} | null>(null);

/**
 * The open state of the chat, without the chat itself. `Ctrl + /` opens it and `Escape` closes
 * it. A prompt from `askAI` opens it and waits until the chat takes it; a newer prompt replaces one
 * the chat has not sent yet.
 */
export function AIChatOpenProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openState = useMemo(() => ({ open, setOpen }), [open]);
  const [prompt, setPrompt] = useState<PendingPrompt>();
  const nextId = useRef(0);
  const clear = useCallback(
    (id: number) => setPrompt((current) => (current?.id === id ? undefined : current)),
    [],
  );
  const pending = useMemo(() => ({ prompt, clear }), [prompt, clear]);

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    } else if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(
    () =>
      onAskAI((text) => {
        setOpen(true);
        if (!text.trim()) return;
        nextId.current += 1;
        setPrompt({ id: nextId.current, text: text.trim() });
      }),
    [],
  );

  return (
    <OpenContext value={openState}>
      <PendingContext value={pending}>{children}</PendingContext>
    </OpenContext>
  );
}

/** whether the chat is open */
export function useAIChat() {
  return use(OpenContext)!;
}

/** the prompt from `askAI` that the chat has not sent yet; `clear` it once sent */
export function useAIChatPendingPrompt() {
  return use(PendingContext)!;
}

/** a floating button that toggles the chat */
export function AIChatTrigger({ className }: { className?: string }) {
  const { open, setOpen } = useAIChat();
  const t = useTranslations({ note: 'AI chat' });

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: 'secondary' }),
        'fixed inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] bottom-4 z-20 gap-2 rounded-2xl text-fd-muted-foreground shadow-lg transition-[translate,opacity] motion-reduce:transition-none',
        open && 'translate-y-10 opacity-0',
        className,
      )}
      inert={open}
      onClick={() => setOpen(!open)}
    >
      <MessageCircleIcon className="size-4.5" />
      {t('Ask AI')}
    </button>
  );
}
