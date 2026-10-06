import varsJson from './vars.json';

// Writers edit `vars.json`; adding a key there makes it available to `<Var name>` with no change here.
// `pnpm vars:check` fails on a name used in MDX that `vars.json` does not hold.
export const vars = varsJson;

export type VarKey = keyof typeof vars;
