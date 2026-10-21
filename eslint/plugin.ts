/**
 * The `docs` ESLint plugin: this repo's content rules on the `docs/mdx` and `docs/markdown`
 * languages. `eslint.config.ts` enables every rule for `content/`; `frontmatter-schema` for pages
 * only. The rule ids keep the names the old `content:lint` gate used, so the docs still apply.
 */
import type { ESLint } from 'eslint';

import { ContentLanguage } from './language.ts';
import blockComponentInParagraph from './rules/block-component-in-paragraph.ts';
import calloutType from './rules/callout-type.ts';
import componentInHeading from './rules/component-in-heading.ts';
import docusaurusDirective from './rules/docusaurus-directive.ts';
import docusaurusVarToken from './rules/docusaurus-var-token.ts';
import frontmatterSchema from './rules/frontmatter-schema.ts';
import linkInHeading from './rules/link-in-heading.ts';
import markdownInTitle from './rules/markdown-in-title.ts';
import quicklookAnchor from './rules/quicklook-anchor.ts';
import remoteImage from './rules/remote-image.ts';
import siteImport from './rules/site-import.ts';
import tabsNullDefault from './rules/tabs-null-default.ts';
import trInTable from './rules/tr-in-table.ts';
import unknownComponent from './rules/unknown-component.ts';
import unknownTerm from './rules/unknown-term.ts';
import unknownVar from './rules/unknown-var.ts';
import varInCode from './rules/var-in-code.ts';
import varInLink from './rules/var-in-link.ts';

export const rules = {
  'block-component-in-paragraph': blockComponentInParagraph,
  'callout-type': calloutType,
  'component-in-heading': componentInHeading,
  'docusaurus-directive': docusaurusDirective,
  'docusaurus-var-token': docusaurusVarToken,
  'frontmatter-schema': frontmatterSchema,
  'link-in-heading': linkInHeading,
  'markdown-in-title': markdownInTitle,
  'quicklook-anchor': quicklookAnchor,
  'remote-image': remoteImage,
  'site-import': siteImport,
  'tabs-null-default': tabsNullDefault,
  'tr-in-table': trInTable,
  'unknown-component': unknownComponent,
  'unknown-term': unknownTerm,
  'unknown-var': unknownVar,
  'var-in-code': varInCode,
  'var-in-link': varInLink,
};

export type RuleId = keyof typeof rules;

/** Every rule but `frontmatter-schema`, which only a page under `content/docs` must satisfy. */
export const CONTENT_RULES: readonly RuleId[] = (Object.keys(rules) as RuleId[]).filter(
  (id) => id !== 'frontmatter-schema',
);

// ESLint's `Plugin` type wants rules written against its generic `SourceCode`; these are written
// against `MdxSourceCode`, so the object is widened here. `@eslint/markdown` does the same.
const plugin: ESLint.Plugin = {
  meta: { name: 'docs', version: '1.0.0' },
  languages: {
    mdx: new ContentLanguage({ mdx: true }),
    markdown: new ContentLanguage({ mdx: false }),
  },
  rules: rules as unknown as ESLint.Plugin['rules'],
};

export default plugin;
