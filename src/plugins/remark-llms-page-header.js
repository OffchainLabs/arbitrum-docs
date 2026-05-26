const INDEX_URL = 'https://docs.arbitrum.io/llms.txt';

module.exports = function remarkLlmsPageHeader() {
  return (tree) => {
    tree.children.unshift({
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'For a complete page index, fetch ' },
            {
              type: 'link',
              url: INDEX_URL,
              children: [{ type: 'text', value: INDEX_URL }],
            },
          ],
        },
      ],
    });
  };
};
