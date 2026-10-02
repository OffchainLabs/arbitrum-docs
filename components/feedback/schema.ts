import { z } from 'zod';

import { FEEDBACK_MESSAGE_MAX_LENGTH } from './limits';

// Payload contract for the feedback server action, which re-parses what arrives over the wire (a
// server action is a public endpoint). The client imports only the type, so zod stays on the server.
//
// The client sends a pathname, not a URL: the action builds the absolute URL from the site origin,
// so a caller cannot record an arbitrary scheme or host.

export const pageFeedback = z.object({
  opinion: z.enum(['good', 'bad']),
  /** Pathname of the page the feedback was submitted from. */
  pathname: z.string().startsWith('/').max(512),
  message: z.string().max(FEEDBACK_MESSAGE_MAX_LENGTH),
});

export type PageFeedback = z.infer<typeof pageFeedback>;
