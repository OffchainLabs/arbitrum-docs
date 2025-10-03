/**
 * Babel Configuration for Jest Tests
 *
 * Transforms ES modules to CommonJS for Jest compatibility
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'auto',
      },
    ],
  ],
};
