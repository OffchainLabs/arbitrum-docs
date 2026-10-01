'use client';

import { cva } from 'class-variance-authority';
import { usePathname } from 'fumadocs-core/framework';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Collapsible, CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { type SyntheticEvent, useEffect, useState, useTransition } from 'react';

import { cn } from '@/lib/cn';

import { type PageFeedback, pageFeedback } from './schema';

type Opinion = PageFeedback['opinion'];

const RATINGS: { opinion: Opinion; label: string; Icon: typeof ThumbsUp }[] = [
  { opinion: 'good', label: 'Good', Icon: ThumbsUp },
  { opinion: 'bad', label: 'Bad', Icon: ThumbsDown },
];

const rateButtonVariants = cva(
  'inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium border text-sm [&_svg]:size-4 disabled:cursor-not-allowed',
  {
    variants: {
      active: {
        true: 'bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current',
        false: 'text-fd-muted-foreground',
      },
    },
  },
);

/**
 * Feedback bar for the end of a doc page: a thumbs up/down rating that expands into a free-text
 * box on selection.
 *
 * A submitted rating is remembered in `localStorage` per pathname, so returning to a page shows
 * the thank-you state instead of an empty form. "Submit Again" clears that record.
 *
 * @param onSendAction - Server action receiving the validated feedback. Returns whether the event
 *   was recorded; a `false` (or a rejection) leaves the form open with the message intact so the
 *   reader can retry.
 */
export function Feedback({
  onSendAction,
}: {
  onSendAction: (feedback: PageFeedback) => Promise<boolean>;
}) {
  const pathname = usePathname();
  const { previous, setPrevious } = useSubmissionStorage(pathname);
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(e: SyntheticEvent) {
    if (opinion == null) return;

    startTransition(async () => {
      const feedback: PageFeedback = {
        url: location.href,
        opinion,
        message,
      };

      // An error escaping this transition would surface as a page-level render failure. The action
      // handles its own failures, so this only catches a failure to invoke it at all.
      let sent = false;
      try {
        sent = await onSendAction(feedback);
      } catch {
        sent = false;
      }

      setFailed(!sent);
      if (!sent) return;

      setPrevious(feedback);
      setMessage('');
      setOpinion(null);
    });

    e.preventDefault();
  }

  const activeOpinion = previous?.opinion ?? opinion;

  return (
    <Collapsible
      open={opinion !== null || previous !== null}
      onOpenChange={(v) => {
        if (!v) {
          setOpinion(null);
          setFailed(false);
        }
      }}
      className="border-y py-3"
    >
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm font-medium pe-2">How is this guide?</p>
        {RATINGS.map(({ opinion: value, label, Icon }) => (
          <button
            key={value}
            disabled={previous !== null}
            className={rateButtonVariants({ active: activeOpinion === value })}
            onClick={() => {
              setFailed(false);
              setOpinion(value);
            }}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
      <CollapsibleContent className="mt-3">
        {previous ? (
          <div className="px-3 py-6 flex flex-col items-center gap-3 bg-fd-card text-fd-muted-foreground text-sm text-center rounded-xl">
            <p>Thank you for your feedback!</p>
            <button
              className={cn(buttonVariants({ color: 'secondary' }), 'text-xs')}
              onClick={() => {
                setOpinion(previous.opinion);
                setPrevious(null);
              }}
            >
              Submit Again
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => {
                setFailed(false);
                setMessage(e.target.value);
              }}
              className="border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground"
              placeholder="Leave your feedback..."
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === 'Enter') {
                  submit(e);
                }
              }}
            />
            <div className="flex flex-row items-center gap-3">
              <button
                type="submit"
                className={cn(buttonVariants({ color: 'outline' }), 'w-fit px-3')}
                disabled={isPending}
              >
                Submit
              </button>
              {failed ? (
                <p role="alert" className="text-sm text-fd-muted-foreground">
                  Could not send your feedback. Please try again.
                </p>
              ) : null}
            </div>
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function useSubmissionStorage(key: string) {
  const storageKey = `docs-feedback-${key}`;
  const [value, setValue] = useState<PageFeedback | null>(null);

  useEffect(() => {
    const item = localStorage.getItem(storageKey);
    if (item === null) return;

    // Drop anything unreadable rather than trusting it: `JSON.parse` throws on malformed input,
    // and an uncaught throw in an effect fails the page render.
    let parsed: unknown;
    try {
      parsed = JSON.parse(item);
    } catch {
      localStorage.removeItem(storageKey);
      return;
    }

    const result = pageFeedback.safeParse(parsed);
    if (result.success) setValue(result.data);
    else localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    previous: value,
    setPrevious(result: PageFeedback | null) {
      if (result) localStorage.setItem(storageKey, JSON.stringify(result));
      else localStorage.removeItem(storageKey);

      setValue(result);
    },
  };
}
