/** Preserve the legacy SDK exclusion from config-surfaces.mjs before its removal. */
export function isDroppedRedirect(destination: string): boolean {
  return destination === '/sdk' || destination.startsWith('/sdk/');
}

/** Serialize external redirect strings as JavaScript literals, never as source code. */
export function renderRedirectEntries(
  redirects: readonly { source: string; destination: string; permanent: boolean }[],
): string {
  return redirects
    .map(
      ({ source, destination, permanent }) =>
        `  {\n    source: ${JSON.stringify(source)},\n    destination: ${JSON.stringify(destination)},\n` +
        `    permanent: ${JSON.stringify(permanent)},\n  },`,
    )
    .join('\n');
}
