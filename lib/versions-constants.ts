/**
 * Version constants and types shared by the server-side registry and the client-side switcher.
 *
 * These live apart from `lib/versions.ts` because that module imports the generated
 * `collections/server` index, which eagerly imports every compiled MDX page. Importing it from a
 * `'use client'` component pulls the entire docs corpus into the browser bundle, so the switcher
 * imports its constants from here instead.
 */

/** Dropdown label for the live page (the canonical, un-versioned URL). */
export const LATEST_LABEL = 'Latest';
/** Search-param key that selects an archived version (e.g. `?v=v1`). */
export const VERSION_PARAM = 'v';
/** The id representing the live page. */
export const LATEST_ID = 'latest';

/** A version option resolved for display in the switcher. */
export interface VersionOption {
  id: string;
  label: string;
}
