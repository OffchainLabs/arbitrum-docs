---
name: quicklooks
description: Wrap first mentions of glossary terms in an article with data-quicklook-from anchors. Use when a contributor writes or edits a doc and wants glossary hover-cards. Triggers on "add quicklooks", "wrap glossary terms", "quicklook my article", "add glossary links".
---

# Add glossary quicklooks

Quicklooks are hover-cards shown when prose wraps a glossary term in
`<a data-quicklook-from="<key>">term</a>`. This skill wraps the first mention of
each glossary term in a target doc using the deterministic generator (no guessing
of keys).

## Process

1. Identify the target file(s) — the `.md`/`.mdx` doc(s) the contributor is writing or editing.
2. Preview:

   ```shell
   yarn generate-quicklooks <file>
   ```

   Show the contributor the `line → key (display text)` table. The generator skips
   code blocks, headings, frontmatter, imports, existing anchors, and any term
   already wrapped elsewhere in the file. It wraps the first mention only.

3. On confirmation, apply:

   ```shell
   yarn generate-quicklooks <file> --write
   ```

4. Verify every inserted key exists in the glossary:

   ```shell
   yarn notion:verify-quicklooks
   ```

5. Tell the contributor to review the result with `git diff <file>`.

## Notes

- Display text can differ from the key (plurals, capitalization) — that is expected;
  the anchor preserves the term exactly as written.
- Valid keys are the glossary partials in `docs/partials/glossary/` (the `key`
  frontmatter field). The generator reads them from the built `static/glossary.json`.
- If the generator reports the glossary is missing, run `yarn build-glossary` first.
