// @ts-check
// Fallback sidebar for stylus-by-example applications when not generated
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const fallbackSidebar = {
  items: [
    {
      type: 'html',
      value: '<div style="padding: 1rem; background: #f5f5f5; border-radius: 4px; margin: 1rem 0;"><strong>Stylus Applications</strong><br/>Applications are not generated. Run <code>yarn start:fresh</code> or <code>yarn update-docs</code> to generate them.</div>',
      defaultStyle: true,
    },
  ],
};

module.exports = fallbackSidebar.items;