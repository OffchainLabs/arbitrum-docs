import path from 'path';
import logger from '../utils/logger.js';
import FileUtils from '../utils/fileUtils.js';

export class SidebarExtractor {
  constructor(baseDir) {
    this.baseDir = baseDir;
    // sidebars.js is in the repository root, not in the docs subdirectory
    this.repositoryRoot = this.findRepositoryRoot(baseDir);
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

  findRepositoryRoot(baseDir) {
    // Navigate up from docs directory to find repository root
    // Repository root should contain sidebars.js, package.json, and docs/ directory
    let currentDir = baseDir;
    
    while (currentDir !== path.dirname(currentDir)) {
      const sidebarPath = path.join(currentDir, 'sidebars.js');
      const packagePath = path.join(currentDir, 'package.json');
      const docsPath = path.join(currentDir, 'docs');
      
      if (FileUtils.existsSync(sidebarPath) && 
          FileUtils.existsSync(packagePath) && 
          FileUtils.existsSync(docsPath)) {
        return currentDir;
      }
      
      currentDir = path.dirname(currentDir);
    }
    
    // If we can't find the repository root, assume baseDir is already root
    return baseDir;
  }

  async extractSidebars() {
    logger.subsection('Sidebar Structure Analysis');
    
    // Find and load sidebars.js from repository root
    const sidebarPath = path.join(this.repositoryRoot, 'sidebars.js');
    
    logger.debug(`Looking for sidebars.js at: ${sidebarPath}`);
    
    if (!await FileUtils.exists(sidebarPath)) {
      logger.warn(`sidebars.js not found at ${sidebarPath}, skipping sidebar analysis`);
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
      const filePath = path.join(this.repositoryRoot, 'docs', docId + ext);
      if (FileUtils.existsSync(filePath)) {
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
        const fullPath = path.join(this.repositoryRoot, 'docs', testPath + ext);
        
        if (FileUtils.existsSync(fullPath)) {
          return path.join('docs', testPath + ext);
        }
      }
    }
    
    // Return probable path even if file doesn't exist
    return path.join('docs', docId + '.mdx');
  }

  checkDocumentExists(docPath) {
    const fullPath = path.join(this.repositoryRoot, docPath);
    return FileUtils.existsSync(fullPath);
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

  // Navigation Root Analysis Methods

  analyzeSidebarAsRoot() {
    // Analyze sidebars.js as the master navigation tree
    const rootAnalysis = {
      rootFile: path.join(this.repositoryRoot, 'sidebars.js'),
      totalSidebars: this.navigationStructure.size,
      masterNavigationTree: this.buildMasterNavigationTree(),
      documentCoverage: this.analyzeDocumentCoverage(),
      navigationPaths: this.analyzeNavigationPaths(),
      hierarchyBalance: this.analyzeHierarchyBalance(),
      crossReferences: this.analyzeCrossReferences(),
      entryPoints: this.identifyEntryPoints(),
      orphanedDocuments: this.identifyOrphanedDocuments()
    };

    return rootAnalysis;
  }

  buildMasterNavigationTree() {
    // Build a unified tree showing all navigation paths
    const masterTree = {
      root: 'sidebars.js',
      sidebars: {},
      totalDocuments: 0,
      totalCategories: 0,
      maxDepth: 0
    };

    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      masterTree.sidebars[sidebarKey] = {
        title: structure.title,
        documentCount: structure.documents.size,
        categoryCount: structure.categories.size,
        maxDepth: structure.depth,
        structure: this.flattenStructureForAnalysis(structure.entries)
      };

      masterTree.totalDocuments += structure.documents.size;
      masterTree.totalCategories += structure.categories.size;
      masterTree.maxDepth = Math.max(masterTree.maxDepth, structure.depth);
    }

    return masterTree;
  }

  flattenStructureForAnalysis(items, currentDepth = 1) {
    const flattened = [];
    
    for (const item of items) {
      const analysisItem = {
        type: item.type,
        label: item.label,
        depth: currentDepth,
        exists: item.exists !== false
      };

      if (item.type === 'doc') {
        analysisItem.documentId = item.documentId;
        analysisItem.path = item.documentPath;
      } else if (item.type === 'category' && item.items) {
        analysisItem.children = this.flattenStructureForAnalysis(item.items, currentDepth + 1);
        analysisItem.childDocuments = this.countDocumentsInCategory(item.items);
      } else if (item.type === 'link') {
        analysisItem.href = item.href;
        analysisItem.external = item.external;
      }

      flattened.push(analysisItem);
    }

    return flattened;
  }

  analyzeDocumentCoverage() {
    // Determine which documents are covered by navigation
    const allDocumentsInNavigation = new Set();
    const duplicateEntries = [];
    const documentOccurrences = new Map();

    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      for (const docId of structure.documents) {
        allDocumentsInNavigation.add(docId);
        
        if (!documentOccurrences.has(docId)) {
          documentOccurrences.set(docId, []);
        }
        documentOccurrences.get(docId).push(sidebarKey);
      }
    }

    // Find documents that appear in multiple sidebars
    for (const [docId, sidebars] of documentOccurrences.entries()) {
      if (sidebars.length > 1) {
        duplicateEntries.push({
          documentId: docId,
          appearsIn: sidebars,
          count: sidebars.length
        });
      }
    }

    return {
      totalDocumentsInNavigation: allDocumentsInNavigation.size,
      duplicateEntries,
      duplicateCount: duplicateEntries.length,
      documentOccurrences: Object.fromEntries(documentOccurrences)
    };
  }

  analyzeNavigationPaths() {
    // Analyze all possible navigation paths to documents
    const pathAnalysis = {
      totalPaths: 0,
      averagePathLength: 0,
      deepestPath: { depth: 0, path: [], document: null },
      pathDistribution: {},
      categoryAnalysis: new Map()
    };

    const allPaths = [];

    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      const sidebarPaths = this.extractAllPaths(structure.entries, [sidebarKey]);
      allPaths.push(...sidebarPaths);
    }

    pathAnalysis.totalPaths = allPaths.length;
    
    if (allPaths.length > 0) {
      const totalDepth = allPaths.reduce((sum, path) => sum + path.depth, 0);
      pathAnalysis.averagePathLength = (totalDepth / allPaths.length).toFixed(2);
      
      // Find deepest path
      const deepest = allPaths.reduce((max, path) => 
        path.depth > max.depth ? path : max, { depth: 0 });
      pathAnalysis.deepestPath = deepest;

      // Analyze path depth distribution
      for (const path of allPaths) {
        const depth = path.depth;
        pathAnalysis.pathDistribution[depth] = (pathAnalysis.pathDistribution[depth] || 0) + 1;
      }
    }

    return pathAnalysis;
  }

  extractAllPaths(items, currentPath, currentDepth = 1) {
    const paths = [];
    
    for (const item of items) {
      const itemPath = [...currentPath, item.label];
      
      if (item.type === 'doc') {
        paths.push({
          path: itemPath,
          depth: currentDepth,
          documentId: item.documentId,
          exists: item.exists
        });
      } else if (item.type === 'category' && item.items) {
        const childPaths = this.extractAllPaths(item.items, itemPath, currentDepth + 1);
        paths.push(...childPaths);
        
        // If category has a link, add it as a path too
        if (item.linkDocumentId) {
          paths.push({
            path: itemPath,
            depth: currentDepth,
            documentId: item.linkDocumentId,
            exists: item.exists,
            isCategoryLink: true
          });
        }
      }
    }
    
    return paths;
  }

  analyzeHierarchyBalance() {
    // Analyze balance and distribution of navigation hierarchy
    const balance = {
      sidebarBalance: {},
      overallBalance: 'unknown',
      imbalancedSections: [],
      recommendations: []
    };

    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      const sidebarBalance = this.calculateSidebarBalance(structure.entries);
      balance.sidebarBalance[sidebarKey] = sidebarBalance;
      
      if (sidebarBalance.imbalanced) {
        balance.imbalancedSections.push({
          sidebar: sidebarKey,
          issue: sidebarBalance.issue,
          details: sidebarBalance.details
        });
      }
    }

    // Overall balance assessment
    const imbalancedCount = balance.imbalancedSections.length;
    const totalSidebars = this.navigationStructure.size;
    
    if (imbalancedCount === 0) {
      balance.overallBalance = 'well-balanced';
    } else if (imbalancedCount / totalSidebars < 0.3) {
      balance.overallBalance = 'mostly-balanced';
    } else {
      balance.overallBalance = 'imbalanced';
    }

    // Generate recommendations
    balance.recommendations = this.generateBalanceRecommendations(balance.imbalancedSections);

    return balance;
  }

  calculateSidebarBalance(items, depth = 0) {
    const categories = items.filter(item => item.type === 'category');
    const documents = items.filter(item => item.type === 'doc');
    
    if (categories.length === 0) {
      return { balanced: true, imbalanced: false };
    }

    // Analyze category sizes
    const categorySizes = categories.map(cat => ({
      name: cat.label,
      size: cat.totalDocuments || 0,
      depth: depth + 1
    }));

    const sizes = categorySizes.map(cat => cat.size);
    const average = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);

    // Check for significant imbalance
    const imbalanceRatio = maxSize / (minSize || 1);
    const isImbalanced = imbalanceRatio > 3 && maxSize > 10;

    if (isImbalanced) {
      return {
        balanced: false,
        imbalanced: true,
        issue: 'size-imbalance',
        details: {
          maxSize,
          minSize,
          average: average.toFixed(1),
          imbalanceRatio: imbalanceRatio.toFixed(1),
          categories: categorySizes
        }
      };
    }

    // Check for excessive nesting
    const maxDepth = Math.max(...categorySizes.map(cat => cat.depth));
    if (maxDepth > 4) {
      return {
        balanced: false,
        imbalanced: true,
        issue: 'excessive-nesting',
        details: {
          maxDepth,
          recommendedMaxDepth: 4
        }
      };
    }

    return { balanced: true, imbalanced: false };
  }

  generateBalanceRecommendations(imbalancedSections) {
    const recommendations = [];
    
    for (const section of imbalancedSections) {
      if (section.issue === 'size-imbalance') {
        recommendations.push({
          type: 'restructure',
          target: section.sidebar,
          priority: 'medium',
          description: `Consider breaking down large categories or consolidating small ones in ${section.sidebar}`,
          details: section.details
        });
      } else if (section.issue === 'excessive-nesting') {
        recommendations.push({
          type: 'flatten',
          target: section.sidebar,
          priority: 'high',
          description: `Reduce nesting depth in ${section.sidebar} from ${section.details.maxDepth} to ${section.details.recommendedMaxDepth} levels`,
          details: section.details
        });
      }
    }
    
    return recommendations;
  }

  analyzeCrossReferences() {
    // Analyze cross-references between navigation sections
    const crossRefs = {
      htmlLinks: [],
      duplicateDocuments: [],
      missingCrossRefs: [],
      recommendations: []
    };

    // Find HTML links that reference other sections
    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      const htmlItems = this.findHtmlItems(structure.entries);
      
      for (const htmlItem of htmlItems) {
        if (htmlItem.parsedLinks) {
          for (const link of htmlItem.parsedLinks) {
            crossRefs.htmlLinks.push({
              fromSidebar: sidebarKey,
              htmlContent: htmlItem.value,
              linkText: link.text,
              linkHref: link.href,
              external: this.isExternalLink(link.href)
            });
          }
        }
      }
    }

    return crossRefs;
  }

  findHtmlItems(items) {
    const htmlItems = [];
    
    for (const item of items) {
      if (item.type === 'html') {
        htmlItems.push(item);
      } else if (item.type === 'category' && item.items) {
        htmlItems.push(...this.findHtmlItems(item.items));
      }
    }
    
    return htmlItems;
  }

  identifyEntryPoints() {
    // Identify primary entry points in the navigation
    const entryPoints = [];
    
    for (const [sidebarKey, structure] of this.navigationStructure.entries()) {
      // First items in each sidebar are typically entry points
      const firstItems = structure.entries.slice(0, 3);
      
      for (const item of firstItems) {
        if (item.type === 'doc') {
          entryPoints.push({
            type: 'document',
            sidebar: sidebarKey,
            documentId: item.documentId,
            label: item.label,
            path: item.documentPath,
            exists: item.exists
          });
        } else if (item.type === 'category' && item.linkDocumentId) {
          entryPoints.push({
            type: 'category-landing',
            sidebar: sidebarKey,
            documentId: item.linkDocumentId,
            categoryLabel: item.label,
            path: item.linkDocumentPath,
            exists: item.exists
          });
        }
      }
    }
    
    return entryPoints;
  }

  identifyOrphanedDocuments() {
    // This would require cross-referencing with actual document files
    // For now, return structure to be filled by DocumentExtractor integration
    return {
      method: 'requires_document_extractor_integration',
      placeholder: 'Will be filled when integrated with document analysis'
    };
  }
}

export default SidebarExtractor;