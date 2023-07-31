// Docusaurus MDX plugins reference: https://docusaurus.io/docs/markdown-features/plugins
//
// This plugin is based on https://github.com/facebook/docusaurus/issues/395
// For future reference, we can virtually use any pattern to match against variables,
// but there's a limitation for handling text enclosed between single backticks (`) or triple backticks (```)
// Docusaurus formats the code enclosed in backticks to apply syntax highlighting.
// When using certain characters as part of the pattern, they will not match and the variable will not be injected.
// These characters are: [, {, (, |, &, and probably some others
// Here are some valid patterns
//    ^FOO => /\^([a-zA-Z0-9_-]+)/g
//    ::FOO => /\:\:([a-zA-Z0-9_-]+)/g
//    @ FOO @ => /\@\s*([a-zA-Z0-9_-]+)\s*\@/g
//    :: FOO :: => /\:\:\s*([a-zA-Z0-9_-]+)\s*\:\:/g

const visit = require('unist-util-visit');

const plugin = (options) => {
  return async (ast) => {
    // visit() will match all nodes form the AST that have one of the types specified
    // in the second argument.
    // In those nodes, we want to inject variables in different fields:
    //    - For 'text' and 'code' nodes, we'll look in the "value" property
    //    - For 'link' nodes, we'll look in the "url" property
    visit(ast, ['text', 'code', 'link'], (node) => {
      let value;
      switch (node.type) {
        case 'link':
          value = node.url;
          break;

        case 'text':
        case 'code':
          value = node.value;
          break;
      }

      // This matches text between two '@'.
      // It can include spaces between each '@' character and the text
      // It allows upper and lowercase characters, numbers and the symbols _ and -
      // Examples =>
      //    @var@
      //    @ var @
      //    @my-var @
      //    @ my-4th_var@
      value = value.replace(/\@\s*([a-zA-Z0-9_-]+)\s*\@/g, (match, varName) => {
        return options.replacements[varName] || match;
      });

      switch (node.type) {
        case 'link':
          node.url = value;
          break;

        case 'text':
        case 'code':
          node.value = value;
          break;
      }
    });
  };
};

module.exports = plugin;
