// Based on https://github.com/facebook/docusaurus/issues/395
// For future reference, we can virtually use any pattern to match agains variables,
// but there's a limitation for handling text enclosed between single backticks (`) or triple backticks (```)
// Docusaurus formats the code enclosed in backticks to apply certain styles to some characters
// (to highlight instructions, operators, ...)
// When using those characters as part of the pattern, they will not match and the variable will not be
// injected.
// These characters are: [, {, (, |
// Here are some valid patterns
//    ^FOO => /\^([a-zA-Z0-9_-]+)/g
//    ::FOO => /\:\:([a-zA-Z0-9_-]+)/g
//    @ FOO @ => /\@\s*([a-zA-Z0-9_-]+)\s*\@/g
//    :: FOO :: => /\:\:\s*([a-zA-Z0-9_-]+)\s*\:\:/g

const visit = require('unist-util-visit');

const plugin = (options) => {
  const transformer = async (ast) => {
    visit(ast, ['text', 'code', 'link'], (node) => {
      // Replace all occurrences of [[ varName ]] with the value of varName
      let value;
      switch(node.type) {
        case "link":
          value = node.url;
          break;
        
        case "text":
        case "code":
          value = node.value;
          break;
      }

      value = value.replace(/\@\s*([a-zA-Z0-9_-]+)\s*\@/g, (match, varName) => {
        return options.replacements[varName] || match;
      });

      switch (node.type) {
        case "link":
          node.url = value;
          break;

        case "text":
        case "code":
          node.value = value;
          break;
      }

      /*
      node.value = node.value.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, varName) => {
        return options.replacements[varName] || match;
      }); */
    });
  };
  return transformer;
};

module.exports = plugin;