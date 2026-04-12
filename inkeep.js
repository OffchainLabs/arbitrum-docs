// Shared Inkeep configuration
const inkeepBaseSettings = {
  apiKey: process.env.INKEEP_API_KEY,
  primaryBrandColor: '#213147',
  organizationDisplayName: 'Arbitrum',
  theme: {
    syntaxHighlighter: {
      lightTheme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/palenight'),
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
