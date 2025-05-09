# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Start development server: `cd website && yarn start`
- Build website: `cd website && yarn build`
- Format code: `cd website && yarn format`
- Run tests: `cd website && yarn test`
- Typecheck: `cd website && yarn typecheck`
- Find orphan pages: `cd website && yarn find-orphan-pages`

## SDK Commands
- Build SDK: `cd arbitrum-sdk && yarn build`
- Test SDK (all): `cd arbitrum-sdk && yarn test`
- Test SDK (unit): `cd arbitrum-sdk && yarn test:unit`
- Lint SDK: `cd arbitrum-sdk && yarn lint`

## Code Style Guidelines
- TypeScript: Use strict mode with noImplicitAny, strictNullChecks
- Formatting: Follow Prettier config with single quotes
- Naming: Use camelCase for variables/functions, PascalCase for classes/types
- Error handling: Prefer explicit error handling with types
- Imports: Group imports (external libs first, then internal)
- Documentation: Include JSDoc comments for public APIs
- Prefer const over let when variables aren't reassigned

## References

### References to this repository
- https://docusaurus.io/docs/3.6.3

### References to potential improvements

- Generating dynamic pages in Docusaurus: https://www.tzeyiing.com/posts/how-to-generate-dynamic-pages-for-docusaurus/
- Creating a custom Docusaurus plugin: https://docusaurus.io/docs/3.6.3/api/plugins
- Managing Docusaurus configuration: https://docusaurus.io/docs/3.6.3/api/docusaurus-config
- Using partials with docusaurus: https://docusaurus.io/docs/3.6.3/markdown-features/react#importing-markdown


