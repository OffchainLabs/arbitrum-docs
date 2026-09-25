/**
 * The site-URL rule, in one place.
 *
 * Two things have to apply this rule. `lib/shared.ts` is app code compiled by Next, and
 * `next.config.ts` is evaluated by Node before any of that exists (Next transpiles it and the
 * `.ts` files it imports on the fly). The rule used to be written out by hand in both, and the copy
 * that actually enforces it during a build was the copy with no tests. `next.config.ts` is the
 * earliest thing a build evaluates, which makes it the check that always fires, including for a
 * build whose prerendered routes never reach `getSiteUrl()`. One module imported by both means the
 * enforcing copy and the tested copy are the same copy.
 *
 * Takes its environment as an argument rather than reading `process.env`, so the tests can call it
 * directly instead of through a subprocess.
 */

/** Used whenever the site URL is not configured and we are not building for production. */
export const localSiteUrl = 'http://localhost:3000';

const missingMessage =
  'NEXT_PUBLIC_SITE_URL is not set in a production build. Set it to the public origin of the ' +
  'site (for example https://docs.arbitrum.io) in the Vercel project environment variables. ' +
  `Without it every canonical and social image URL would be built pointing at ${localSiteUrl}.`;

/**
 * Resolve the absolute origin this site is served from, for `metadataBase`, canonical URLs, and
 * anything else that must be absolute.
 *
 * **This throws rather than guessing, and that is the point.** `NEXT_PUBLIC_SITE_URL` is inlined at
 * build time, so a build that runs without it bakes the localhost fallback into every canonical and
 * social image URL in the deployed output. Those pages then tell crawlers that the canonical copy
 * of each page lives on localhost, which is worse than emitting no canonical at all, and nothing
 * about the running site reveals the mistake. Failing the production build is the only point where
 * it is still cheap to fix.
 *
 * A configured value is parsed, not trusted. An origin pasted without a scheme
 * (`docs.arbitrum.io`) satisfies every presence check, then throws inside `new URL()` at the root
 * layout's module scope on the first request after promotion, taking down every route on the site.
 * That is the same class of failure as the unset case and strictly worse, because the unset case at
 * least fails the build. Parsing here moves it back to the build.
 *
 * Outside production the localhost fallback is correct and convenient: `pnpm dev`, `pnpm build` on
 * a laptop, CI, and preview deployments all work with nothing configured.
 *
 * @param env Usually `process.env`.
 * @returns The origin, guaranteed parseable by `new URL()`.
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

  // `VERCEL_ENV` is server-side and always present in a Vercel build. `NEXT_PUBLIC_VERCEL_ENV` is
  // its build-inlined twin, which exists only when the project exposes system environment
  // variables, so both are consulted and neither is required.
  const deploymentEnv = env.VERCEL_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV;

  if (deploymentEnv === 'production') throw new Error(missingMessage);

  return localSiteUrl;
}
