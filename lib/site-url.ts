/**
 * The site-URL rule, in one place: `lib/shared.ts` (app code) and `next.config.ts` (evaluated
 * before any app code exists) both apply it. Takes `env` as an argument so tests call it directly.
 */

/** Used whenever the site URL is not configured and we are not building for production. */
export const localSiteUrl = 'http://localhost:3000';

const missingMessage =
  'NEXT_PUBLIC_SITE_URL is not set in a production build. Set it to the public origin of the ' +
  'site (for example https://docs.arbitrum.io) in the Vercel project environment variables. ' +
  `Without it every canonical and social image URL would be built pointing at ${localSiteUrl}.`;

/**
 * Resolve the absolute origin this site is served from. Throws in a production build rather than
 * guessing: `NEXT_PUBLIC_SITE_URL` is inlined at build time, so a missing one would bake localhost
 * into every canonical and social URL, and a value with no scheme would throw in `new URL()` at the
 * root layout's module scope on the first request. Localhost otherwise.
 */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  const configured = env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    try {
      new URL(configured);
    } catch {
      throw new Error(
        `NEXT_PUBLIC_SITE_URL is not a valid absolute URL: ${JSON.stringify(configured)}. Set it ` +
          'to the public origin of the site including the scheme (for example ' +
          'https://docs.arbitrum.io) in the Vercel project environment variables. Without a ' +
          'scheme every canonical and social image URL fails to build and the deployed site ' +
          'returns 500 on every route.',
      );
    }
    return configured;
  }

  // `VERCEL_ENV` is always present in a Vercel build; `NEXT_PUBLIC_VERCEL_ENV` is its build-inlined
  // twin, present only when the project exposes system environment variables.
  const deploymentEnv = env.VERCEL_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV;

  if (deploymentEnv === 'production') throw new Error(missingMessage);

  return localSiteUrl;
}
