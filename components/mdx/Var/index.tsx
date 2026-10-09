import { type VarKey, vars } from '@/content/vars';

/**
 * Server component that renders a global variable inline in MDX.
 *
 * Usage in MDX:
 *   <Var name="latestNitroVersion" />
 *
 * Values come from `content/vars.json`. `.mdx` never passes through `tsc`, so `VarKey` does not
 * protect MDX callers: an unknown name renders the string `undefined`, and `pnpm vars:check` is the
 * gate that catches it.
 */
export function Var({ name }: { name: VarKey }) {
  return <>{String(vars[name])}</>;
}
