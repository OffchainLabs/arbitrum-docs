import { z } from 'zod';

// Payload contract shared by the client component and the server action. Validated on both
// sides: the client parses what it restored from localStorage, the action re-parses what
// arrived over the wire (a server action is a public endpoint — never trust its input).

export const pageFeedback = z.object({
  opinion: z.enum(['good', 'bad']),
  /** Full URL of the page the feedback was submitted from. */
  url: z.url(),
  message: z.string(),
});

export type PageFeedback = z.infer<typeof pageFeedback>;
