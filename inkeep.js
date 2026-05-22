// Shared Inkeep configuration.
// The Inkeep `onEvent` analytics handler lives in `./inkeep.config.js` (client module).
// Functions can't be passed through themeConfig — they get stripped during JSON serialization.

const inkeepBaseSettings = {
  apiKey: process.env.INKEEP_API_KEY,
  primaryBrandColor: '#213147',
  organizationDisplayName: 'Arbitrum',
  theme: {
    syntaxHighlighter: {
      lightTheme: prismThemes.github,
      darkTheme: prismThemes.palenight,
    },
  },
};

const inkeepModalSettings = {
  placeholder: 'Search documentation...',
  defaultQuery: '',
  maxResults: 40,
  debounceTimeMs: 300,
  shouldOpenLinksInNewTab: true,
};

const inkeepExampleQuestions = [
  'How to estimate gas in Arbitrum?',
  'What is the difference between Arbitrum One and Nova?',
  'How to deploy a smart contract on Arbitrum?',
  'What are Arbitrum Orbit chains?',
  'How does Arbitrum handle L1 to L2 messaging?',
  'What is Arbitrum Stylus?',
];

module.exports = { inkeepBaseSettings, inkeepModalSettings, inkeepExampleQuestions };
