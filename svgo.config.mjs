/**
 * svgo configuration for hand-authored brand diagrams in static/img.
 *
 * Applied by .claude/hooks/optimize-svg.sh on every write to static/img/*.svg,
 * and safe to run manually: yarn svgo --config svgo.config.mjs <file>
 *
 * The overrides below all disable a preset-default plugin. Each one would
 * otherwise break something these diagrams depend on, so do not drop them
 * without checking the rendered page.
 */
export default {
  multipass: true,
  js2svg: { indent: 2, pretty: false },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Docs SVGs scale to their container. Without viewBox they render at
          // a fixed intrinsic size and overflow the article column.
          removeViewBox: false,

          // Diagrams reference ids internally (gradients, clipPaths, markers,
          // <use>) and from MDX. Minifying them silently breaks those links.
          cleanupIds: false,

          // <title> and <desc> are the accessible name and description for
          // screen readers. preset-default strips both by default.
          removeTitle: false,
          removeDesc: false,

          // 2 decimals keeps arrow joins and rounded corners visually exact
          // while still dropping most of the coordinate bloat.
          convertPathData: { floatPrecision: 2 },
          cleanupNumericValues: { floatPrecision: 2 },
        },
      },
    },
  ],
};
