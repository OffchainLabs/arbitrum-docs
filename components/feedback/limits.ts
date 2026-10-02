/**
 * Bounds the feedback action enforces (`schema.ts`) and the form shows (`client.tsx`). Kept apart
 * from the zod schema so the client can import the number without pulling zod into its chunk.
 */
export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;
