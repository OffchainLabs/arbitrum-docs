import { type VarKey, vars } from '@/content/vars';

/**
 * Server component that renders a global variable inline in MDX.
 *
 * Usage in MDX:
 *   <Var name="latestNitroVersion" />
 *
 * Values are read at render time from the typed `vars` module (single source of
 * truth = `content/vars.json`).
 *
 * `VarKey` does NOT protect MDX callers: `.mdx` is compiled by fumadocs-mdx and
 * never passes through `tsc`, so an unknown name is not a build error — it
 * renders the literal string `undefined` into the page. `content/vars.ts` also
 * validates with `z.object`, which silently strips JSON keys missing from the
 * schema, so a key can be present in `vars.json` and still resolve to
 * `undefined`. `pnpm vars:check` is the gate that actually catches both.
 */
export function Var({ name }: { name: VarKey }) {
  return <>{String(vars[name])}</>;
}
