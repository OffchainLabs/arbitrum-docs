/**
 * This function generates the sidebar for the SDK reference documentation
 * It requires the plugin typedoc-plugin-markdown to be enabled (Version >= 4.0.0)
 * More information in: https://github.com/tgreyuk/typedoc-plugin-markdown/blob/next/packages/typedoc-plugin-markdown/README.md
 *
 * It also requires the following options to be set in typedoc:
 *    - outputFileStrategy: 'modules'
 *
 * Reference of the function: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#SidebarGenerator
 */
const sdkSidebarGenerator = async ({
  defaultSidebarItemsGenerator,
  numberPrefixParser,
  item,
  version,
  docs,
  categoriesMetadata,
  isCategoryIndex,
}) => {
  const sidebar = [];
  const categories = {};

  const createSidebarEntryFromItem = (item) => {
    return {
      type: 'doc',
      id: item.id,
      label: item.title,
    };
  };

  for (const item of docs) {
    // Look for the index file
    if (item.id == 'index') {
      sidebar.push(createSidebarEntryFromItem(item));
      continue;
    }

    // Check if the item references a file inside one of the main folders
    // In that case, a category for that folder should be created
    if (item.title.includes('/')) {
      const categoryName = item.title.split('/')[0];
      const entryTitle = item.title.split('/')[1];

      // Create the category (if needed)
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }

      // Add the item inside the category
      categories[categoryName].push(createSidebarEntryFromItem({ ...item, title: entryTitle }));
    }
  }

  // Create the categories and add the items in the sidebar
  for (const [categoryName, categoryItems] of Object.entries(categories)) {
    sidebar.push({
      type: 'category',
      label: categoryName,
      collapsed: true,
      items: categoryItems,
    });
  }

  // Return
  return sidebar;
};

module.exports = sdkSidebarGenerator;
