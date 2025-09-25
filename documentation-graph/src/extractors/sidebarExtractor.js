import path from 'path';
import logger from '../utils/logger.js';
import FileUtils from '../utils/fileUtils.js';

export class SidebarExtractor {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.sidebarData = null;
    this.navigationStructure = new Map();
    this.documentPaths = new Set();
    this.sidebarMetrics = {
      totalSidebars: 0,
      totalEntries: 0,
      totalDocuments: 0,
      totalCategories: 0,
      totalLinks: 0,
      maxDepth: 0,
      orphanedEntries: 0
    };
  }

  async extractSidebars() {
    logger.subsection('Sidebar Structure Analysis');
    
    // Find and load sidebars.js
    const sidebarPath = path.join(this.baseDir, 'sidebars.js');
    
    if (!await FileUtils.fileExists(sidebarPath)) {
      logger.warn('sidebars.js not found, skipping sidebar analysis');
      return null;
    }

    try {
      // Read sidebars.js content
      const sidebarContent = await FileUtils.readFile(sidebarPath);
      if (!sidebarContent) {
        logger.warn('Empty sidebars.js file');
        return null;
      }

      // Parse the sidebar structure
      this.sidebarData = await this.parseSidebarStructure(sidebarPath);
      
      // Extract navigation hierarchy
      this.extractNavigationHierarchy();
      
      // Calculate sidebar metrics
      this.calculateSidebarMetrics();
      
      logger.success(`Analyzed ${this.sidebarMetrics.totalSidebars} sidebar configurations with ${this.sidebarMetrics.totalEntries} entries`);
      
      return {
        structure: this.navigationStructure,
        metrics: this.sidebarMetrics,
        documentPaths: this.documentPaths,
        sidebarData: this.sidebarData
      };

    } catch (error) {
      logger.error('Error extracting sidebar structure:', error.message);
      return null;
    }
  }

  async parseSidebarStructure(sidebarPath) {
    try {
      // Import the sidebars.js module dynamically
      const sidebarModule = await import(`file://${sidebarPath}`);
      const sidebars = sidebarModule.default || sidebarModule;
      
      if (typeof sidebars !== 'object') {
        throw new Error('Invalid sidebars.js structure');
      }

      return sidebars;
    } catch (error) {
      logger.error('Failed to parse sidebars.js:', error.message);
      throw error;
    }
  }

  extractNavigationHierarchy() {
    if (!this.sidebarData) return;

    for (const [sidebarKey, sidebarConfig] of Object.entries(this.sidebarData)) {
      logger.debug(`Processing sidebar: ${sidebarKey}`);
      
      const sidebarStructure = {
        key: sidebarKey,
        title: this.extractSidebarTitle(sidebarConfig),
        entries: [],
        documents: new Set(),
        categories: new Set(),
        links: new Set(),
        depth: 0
      };

      if (Array.isArray(sidebarConfig)) {
        sidebarStructure.entries = this.processSidebarItems(sidebarConfig, 1, sidebarStructure);
      }

      this.navigationStructure.set(sidebarKey, sidebarStructure);
    }
  }

  processSidebarItems(items, currentDepth, sidebarStructure) {
    const processedItems = [];
    
    for (const item of items) {
      const processedItem = this.processSidebarItem(item, currentDepth, sidebarStructure);
      if (processedItem) {
        processedItems.push(processedItem);
        
        // Update max depth
        sidebarStructure.depth = Math.max(sidebarStructure.depth, currentDepth);
      }
    }
    
    return processedItems;
  }

  processSidebarItem(item, depth, sidebarStructure) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const processedItem = {
      type: item.type || 'unknown',
      depth,
      label: item.label || 'Unlabeled',
      originalItem: item
    };

    switch (item.type) {
      case 'doc':
        processedItem.documentId = item.id;
        processedItem.documentPath = this.resolveDocumentPath(item.id);
        
        // Track document in sidebar structure
        sidebarStructure.documents.add(item.id);
        this.documentPaths.add(item.id);
        
        // Check if document file exists
        processedItem.exists = this.checkDocumentExists(processedItem.documentPath);
        
        break;

      case 'category':
        processedItem.collapsed = item.collapsed !== undefined ? item.collapsed : false;
        processedItem.items = [];
        processedItem.link = item.link || null;
        
        // Track category
        sidebarStructure.categories.add(item.label);
        
        // Process nested items
        if (item.items && Array.isArray(item.items)) {
          processedItem.items = this.processSidebarItems(item.items, depth + 1, sidebarStructure);
          
          // Calculate category statistics
          processedItem.totalDocuments = this.countDocumentsInCategory(processedItem.items);
          processedItem.totalSubcategories = this.countSubcategories(processedItem.items);
        }
        
        // Process category link if it exists
        if (item.link && item.link.type === 'doc') {
          processedItem.linkDocumentId = item.link.id;
          processedItem.linkDocumentPath = this.resolveDocumentPath(item.link.id);
          sidebarStructure.documents.add(item.link.id);
          this.documentPaths.add(item.link.id);
        }
        
        break;

      case 'link':
        processedItem.href = item.href;
        processedItem.external = this.isExternalLink(item.href);
        
        // Track external links
        if (processedItem.external) {
          sidebarStructure.links.add(item.href);
        }
        
        break;

      case 'html':
        processedItem.value = item.value;
        processedItem.parsedLinks = this.extractLinksFromHTML(item.value);
        
        // Track any extracted links
        processedItem.parsedLinks.forEach(link => {
          if (this.isExternalLink(link.href)) {
            sidebarStructure.links.add(link.href);
          } else {
            // Internal link - convert to document path
            const docPath = this.convertUrlToDocPath(link.href);
            if (docPath) {
              sidebarStructure.documents.add(docPath);
              this.documentPaths.add(docPath);
            }
          }
        });
        
        break;

      case 'autogenerated':
        processedItem.dirName = item.dirName;
        processedItem.note = 'Auto-generated from directory structure';
        break;

      default:
        logger.warn(`Unknown sidebar item type: ${item.type}`);
    }

    return processedItem;
  }

  extractSidebarTitle(sidebarConfig) {
    if (Array.isArray(sidebarConfig) && sidebarConfig.length > 0) {
      const firstItem = sidebarConfig[0];
      if (firstItem.type === 'category') {
        return firstItem.label;
      }
    }
    return 'Unnamed Sidebar';
  }

  resolveDocumentPath(docId) {
    // Convert Docusaurus document ID to file path
    // e.g., 'build-decentralized-apps/quickstart-solidity-remix' -> 'docs/build-decentralized-apps/quickstart-solidity-remix.mdx'
    const possibleExtensions = ['.mdx', '.md'];
    
    // First try direct match
    for (const ext of possibleExtensions) {
      const filePath = path.join(this.baseDir, 'docs', docId + ext);
      if (FileUtils.fileExistsSync(filePath)) {
        return path.join('docs', docId + ext);
      }
    }
    
    // If direct match fails, try with numeric prefixes (common Docusaurus pattern)
    // e.g., 'get-started' might be '01-get-started.mdx'
    const pathParts = docId.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const dirPath = pathParts.slice(0, -1).join('/');
    
    for (const ext of possibleExtensions) {
      // Try patterns like 01-filename, 02-filename, etc.
      for (let i = 1; i <= 20; i++) {
        const prefix = i.toString().padStart(2, '0');
        const prefixedFileName = `${prefix}-${fileName}`;
        const testPath = dirPath ? path.join(dirPath, prefixedFileName) : prefixedFileName;
        const fullPath = path.join(this.baseDir, 'docs', testPath + ext);
        
        if (FileUtils.fileExistsSync(fullPath)) {
          return path.join('docs', testPath + ext);
        }
      }
    }
    
    // Return probable path even if file doesn't exist
    return path.join('docs', docId + '.mdx');
  }

  checkDocumentExists(docPath) {
    const fullPath = path.join(this.baseDir, docPath);
    return FileUtils.fileExistsSync(fullPath);
  }

  isExternalLink(href) {
    return href && (href.startsWith('http://') || href.startsWith('https://'));
  }

  extractLinksFromHTML(htmlValue) {
    const links = [];
    // Simple regex to extract links from HTML anchor tags
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(htmlValue)) !== null) {
      links.push({
        href: match[1],
        text: match[2].trim()
      });
    }
    
    return links;
  }

  convertUrlToDocPath(url) {
    // Convert internal URLs to document paths
    // e.g., '/build-decentralized-apps/quickstart' -> 'build-decentralized-apps/quickstart'
    if (url.startsWith('/')) {
      return url.substring(1);
    }
    return url;
  }

  countDocumentsInCategory(items) {
    let count = 0;
    for (const item of items) {
      if (item.type === 'doc') {
        count++;
      } else if (item.type === 'category' && item.items) {
        count += this.countDocumentsInCategory(item.items);
      }
    }
    return count;
  }

  countSubcategories(items) {
    let count = 0;
    for (const item of items) {
      if (item.type === 'category') {
        count++;
        if (item.items) {
          count += this.countSubcategories(item.items);
        }
      }
    }
    return count;
  }

  calculateSidebarMetrics() {
    this.sidebarMetrics.totalSidebars = this.navigationStructure.size;
    
    for (const [key, structure] of this.navigationStructure.entries()) {
      this.sidebarMetrics.totalEntries += this.countTotalEntries(structure.entries);
      this.sidebarMetrics.totalDocuments += structure.documents.size;
      this.sidebarMetrics.totalCategories += structure.categories.size;
      this.sidebarMetrics.totalLinks += structure.links.size;
      this.sidebarMetrics.maxDepth = Math.max(this.sidebarMetrics.maxDepth, structure.depth);
    }

    // Calculate orphaned entries (sidebar references to non-existent files)
    this.sidebarMetrics.orphanedEntries = this.calculateOrphanedEntries();
  }

  countTotalEntries(items) {
    let count = items.length;
    for (const item of items) {
      if (item.type === 'category' && item.items) {
        count += this.countTotalEntries(item.items);
      }
    }
    return count;
  }

  calculateOrphanedEntries() {
    let orphanedCount = 0;
    
    for (const [key, structure] of this.navigationStructure.entries()) {
      orphanedCount += this.countOrphanedInStructure(structure.entries);
    }
    
    return orphanedCount;
  }

  countOrphanedInStructure(items) {
    let count = 0;
    
    for (const item of items) {
      if (item.type === 'doc' && item.exists === false) {
        count++;
      } else if (item.type === 'category') {
        if (item.linkDocumentId && !this.checkDocumentExists(item.linkDocumentPath)) {
          count++;
        }
        if (item.items) {
          count += this.countOrphanedInStructure(item.items);
        }
      }
    }
    
    return count;
  }

  // Analysis methods for integration with graph analyzer

  getNavigationPath(documentId) {
    // Find the navigation path(s) for a given document
    const paths = [];
    
    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      const path = this.findDocumentPath(structure.entries, documentId, [sidebarKey]);
      if (path) {
        paths.push(path);
      }
    }
    
    return paths;
  }

  findDocumentPath(items, targetDocId, currentPath) {
    for (const item of items) {
      const newPath = [...currentPath, item.label];
      
      if (item.type === 'doc' && item.documentId === targetDocId) {
        return newPath;
      } else if (item.type === 'category') {
        if (item.linkDocumentId === targetDocId) {
          return newPath;
        }
        if (item.items) {
          const found = this.findDocumentPath(item.items, targetDocId, newPath);
          if (found) {
            return found;
          }
        }
      }
    }
    
    return null;
  }

  getNavigationDepth(documentId) {
    let maxDepth = 0;
    const paths = this.getNavigationPath(documentId);
    
    for (const path of paths) {
      maxDepth = Math.max(maxDepth, path.length - 1); // Subtract 1 for sidebar name
    }
    
    return maxDepth;
  }

  getDocumentSiblings(documentId) {
    // Find other documents at the same level in navigation
    const siblings = new Set();
    
    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      const docSiblings = this.findDocumentSiblings(structure.entries, documentId);
      docSiblings.forEach(sibling => siblings.add(sibling));
    }
    
    return Array.from(siblings);
  }

  findDocumentSiblings(items, targetDocId) {
    const siblings = [];
    
    for (const item of items) {
      if (item.type === 'doc' && item.documentId === targetDocId) {
        // Found the target, collect all other docs at this level
        for (const siblingItem of items) {
          if (siblingItem.type === 'doc' && siblingItem.documentId !== targetDocId) {
            siblings.push(siblingItem.documentId);
          }
        }
        return siblings;
      } else if (item.type === 'category' && item.items) {
        const found = this.findDocumentSiblings(item.items, targetDocId);
        if (found.length > 0) {
          return found;
        }
      }
    }
    
    return siblings;
  }

  getCategoryStructure() {
    // Get hierarchical category structure for analysis
    const categories = [];
    
    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      categories.push({
        sidebar: sidebarKey,
        structure: this.extractCategoryHierarchy(structure.entries, 0)
      });
    }
    
    return categories;
  }

  extractCategoryHierarchy(items, depth) {
    const hierarchy = [];
    
    for (const item of items) {
      if (item.type === 'category') {
        hierarchy.push({
          name: item.label,
          depth,
          documentCount: item.totalDocuments || 0,
          subcategoryCount: item.totalSubcategories || 0,
          collapsed: item.collapsed,
          children: item.items ? this.extractCategoryHierarchy(item.items, depth + 1) : []
        });
      }
    }
    
    return hierarchy;
  }

  getStats() {
    return {
      ...this.sidebarMetrics,
      documentsCovered: this.documentPaths.size,
      navigationStructures: this.navigationStructure.size,
      averageDepth: this.sidebarMetrics.totalSidebars > 0 ? this.sidebarMetrics.maxDepth / this.sidebarMetrics.totalSidebars : 0
    };
  }
}

export default SidebarExtractor;