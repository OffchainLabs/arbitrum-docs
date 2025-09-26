import Graph from 'graphology';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger.js';

export class GraphBuilder {
  constructor() {
    this.graph = new Graph({ multi: false, allowSelfLoops: false });
    this.nodeTypes = {
      DOCUMENT: 'document',
      CONCEPT: 'concept',
      SECTION: 'section',
      DIRECTORY: 'directory',
      TAG: 'tag',
      NAVIGATION_ROOT: 'navigation_root'
    };
    
    this.edgeTypes = {
      CONTAINS: 'contains',
      MENTIONS: 'mentions',
      LINKS_TO: 'links_to',
      SIMILAR: 'similar',
      PARENT_CHILD: 'parent_child',
      CO_OCCURS: 'co_occurs',
      DEFINES_NAVIGATION: 'defines_navigation',
      NAVIGATION_ENTRY: 'navigation_entry'
    };

    this.stats = {
      totalNodes: 0,
      totalEdges: 0,
      nodesByType: {},
      edgesByType: {}
    };
  }

  async buildGraph(documents, concepts, conceptData, sidebarData = null) {
    logger.section('Knowledge Graph Construction Phase');
    
    this.logMemoryUsage('Graph construction start');
    
    // Add navigation root node if sidebar data is available
    if (sidebarData) {
      this.addNavigationRootNode(sidebarData);
      this.logMemoryUsage('After adding navigation root node');
    }
    
    // Add document nodes
    this.addDocumentNodes(documents);
    this.logMemoryUsage('After adding document nodes');
    
    // Add concept nodes
    this.addConceptNodes(concepts, conceptData.frequency);
    this.logMemoryUsage('After adding concept nodes');
    
    // Add directory structure
    this.addDirectoryStructure(documents);
    this.logMemoryUsage('After adding directory structure');
    
    // Connect navigation root to documents if sidebar data is available
    if (sidebarData) {
      this.connectNavigationRoot(sidebarData, documents);
      this.logMemoryUsage('After connecting navigation root');
    }
    
    // Add relationships
    this.addDocumentConcepts(documents, concepts);
    this.logMemoryUsage('After adding document-concept relationships');
    
    this.addDocumentLinks(documents);
    this.logMemoryUsage('After adding document links');
    
    this.addConceptCooccurrence(conceptData.cooccurrence);
    this.logMemoryUsage('After adding concept co-occurrence');
    
    this.addSimilarityEdges(concepts);
    this.logMemoryUsage('After adding similarity edges');
    
    this.calculateStats();
    
    logger.success(`Built knowledge graph with ${this.stats.totalNodes} nodes and ${this.stats.totalEdges} edges`);
    
    return this.graph;
  }

  logMemoryUsage(stage) {
    const used = process.memoryUsage();
    const heapUsedMB = (used.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMB = (used.heapTotal / 1024 / 1024).toFixed(2);
    logger.debug(`${stage}: Heap ${heapUsedMB}/${heapTotalMB} MB`);
  }

  addDocumentNodes(documents) {
    logger.subsection('Adding document nodes');
    
    for (const [filePath, document] of documents) {
      const nodeId = this.getDocumentNodeId(filePath);
      
      // Skip if node already exists
      if (this.graph.hasNode(nodeId)) {
        continue;
      }
      
      this.graph.addNode(nodeId, {
        id: nodeId,
        type: this.nodeTypes.DOCUMENT,
        label: document.fileName,
        filePath: document.filePath,
        relativePath: document.relativePath,
        directory: document.directory,
        extension: document.extension,
        title: document.frontmatter?.title || document.fileName,
        description: document.frontmatter?.description || '',
        contentType: document.frontmatter?.content_type || 'unknown',
        tags: document.frontmatter?.tags || [],
        wordCount: document.stats.wordCount,
        headingCount: document.stats.headingCount,
        linkCount: document.stats.linkCount,
        codeBlockCount: document.stats.codeBlockCount,
        lastModified: document.stats.lastModified,
        navigation: document.navigation,
        size: 1.0, // Base size for visualization
        color: this.getNodeColor(this.nodeTypes.DOCUMENT)
      });

      // Add section nodes for major headings
      document.headings
        .filter(heading => heading.level <= 2)
        .forEach((heading, index) => {
          const sectionId = `${nodeId}_section_${index}`;
          this.graph.addNode(sectionId, {
            id: sectionId,
            type: this.nodeTypes.SECTION,
            label: heading.text,
            level: heading.level,
            headingId: heading.id,
            parentDocument: nodeId,
            size: 0.5,
            color: this.getNodeColor(this.nodeTypes.SECTION)
          });

          // Connect section to document
          this.addEdge(nodeId, sectionId, this.edgeTypes.CONTAINS, { weight: 1.0 });
        });
    }
  }

  addConceptNodes(concepts, frequency) {
    logger.subsection('Adding concept nodes');
    
    for (const [conceptKey, concept] of concepts) {
      const nodeId = this.getConceptNodeId(conceptKey);
      const freq = frequency.get(conceptKey) || 0;
      
      // Skip if node already exists
      if (this.graph.hasNode(nodeId)) {
        continue;
      }
      
      this.graph.addNode(nodeId, {
        id: nodeId,
        type: this.nodeTypes.CONCEPT,
        label: concept.text,
        normalized: concept.normalized,
        conceptType: concept.type,
        category: concept.category || 'general',
        frequency: freq,
        fileCount: concept.files.size,
        sources: Array.from(concept.sources),
        totalWeight: concept.totalWeight,
        size: Math.min(Math.log(freq + 1) * 0.5 + 0.3, 2.0), // Logarithmic scaling
        color: this.getConceptColor(concept.type, concept.category)
      });
    }
  }

  addDirectoryStructure(documents) {
    logger.subsection('Adding directory structure');
    
    const directories = new Set();
    
    // Collect all directories
    for (const [, document] of documents) {
      const parts = document.directory.split('/').filter(part => part);
      let currentPath = '';
      
      for (const part of parts) {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!directories.has(currentPath)) {
          directories.add(currentPath);
          
          const nodeId = this.getDirectoryNodeId(currentPath);
          this.graph.addNode(nodeId, {
            id: nodeId,
            type: this.nodeTypes.DIRECTORY,
            label: part,
            path: currentPath,
            size: 0.8,
            color: this.getNodeColor(this.nodeTypes.DIRECTORY)
          });
          
          // Connect to parent directory
          if (parentPath && directories.has(parentPath)) {
            const parentNodeId = this.getDirectoryNodeId(parentPath);
            this.addEdge(parentNodeId, nodeId, this.edgeTypes.PARENT_CHILD, { weight: 1.0 });
          }
        }
      }
    }
    
    // Connect documents to their directories
    for (const [filePath, document] of documents) {
      if (document.directory && directories.has(document.directory)) {
        const documentNodeId = this.getDocumentNodeId(filePath);
        const directoryNodeId = this.getDirectoryNodeId(document.directory);
        this.addEdge(directoryNodeId, documentNodeId, this.edgeTypes.CONTAINS, { weight: 1.0 });
      }
    }
  }

  addDocumentConcepts(documents, concepts) {
    logger.subsection('Adding document-concept relationships');
    
    for (const [filePath, document] of documents) {
      const documentNodeId = this.getDocumentNodeId(filePath);
      
      for (const [conceptKey, concept] of concepts) {
        if (concept.files.has(filePath)) {
          const conceptNodeId = this.getConceptNodeId(conceptKey);
          const weight = Math.min(concept.totalWeight / concept.files.size, 5.0);
          
          this.addEdge(documentNodeId, conceptNodeId, this.edgeTypes.MENTIONS, {
            weight,
            frequency: concept.totalWeight
          });
        }
      }
    }
  }

  addDocumentLinks(documents) {
    logger.subsection('Adding document cross-references');
    
    for (const [filePath, document] of documents) {
      const sourceNodeId = this.getDocumentNodeId(filePath);
      
      for (const link of document.links.internal) {
        // Resolve the target document
        const targetPath = this.resolveInternalLink(link.resolvedPath, documents);
        if (targetPath) {
          const targetNodeId = this.getDocumentNodeId(targetPath);
          this.addEdge(sourceNodeId, targetNodeId, this.edgeTypes.LINKS_TO, {
            weight: 1.0,
            linkText: link.text,
            href: link.href
          });
        }
      }
    }
  }

  addConceptCooccurrence(cooccurrence) {
    logger.subsection('Adding concept co-occurrence relationships');
    
    for (const [pairKey, count] of cooccurrence) {
      const [concept1, concept2] = pairKey.split('|');
      const node1Id = this.getConceptNodeId(concept1);
      const node2Id = this.getConceptNodeId(concept2);
      
      if (this.graph.hasNode(node1Id) && this.graph.hasNode(node2Id) && count >= 2) {
        const weight = Math.min(Math.log(count) * 0.5, 2.0);
        this.addEdge(node1Id, node2Id, this.edgeTypes.CO_OCCURS, {
          weight,
          cooccurrenceCount: count
        });
      }
    }
  }

  addSimilarityEdges(concepts) {
    logger.subsection('Adding concept similarity relationships');
    
    const conceptList = Array.from(concepts.keys());
    const conceptCount = conceptList.length;
    
    // Memory optimization: limit similarity calculations for large concept sets
    const maxComparisons = 50000; // Limit to prevent memory issues
    const totalComparisons = (conceptCount * (conceptCount - 1)) / 2;
    
    if (totalComparisons > maxComparisons) {
      logger.warn(`Large concept set (${conceptCount} concepts, ${totalComparisons} comparisons). Using optimized similarity calculation.`);
      this.addOptimizedSimilarityEdges(concepts, conceptList, maxComparisons);
      return;
    }
    
    // Process in batches to reduce memory pressure
    const batchSize = 100;
    let edgesAdded = 0;
    
    for (let i = 0; i < conceptList.length; i += batchSize) {
      const endI = Math.min(i + batchSize, conceptList.length);
      
      for (let idx1 = i; idx1 < endI; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < conceptList.length; idx2++) {
          const concept1 = conceptList[idx1];
          const concept2 = conceptList[idx2];
          
          const similarity = this.calculateConceptSimilarity(
            concepts.get(concept1),
            concepts.get(concept2)
          );
          
          if (similarity > 0.3) {
            const node1Id = this.getConceptNodeId(concept1);
            const node2Id = this.getConceptNodeId(concept2);
            
            if (this.addEdge(node1Id, node2Id, this.edgeTypes.SIMILAR, {
              weight: similarity,
              similarity
            })) {
              edgesAdded++;
            }
          }
        }
      }
      
      // Force garbage collection periodically
      if (i % (batchSize * 10) === 0) {
        if (global.gc) {
          global.gc();
        }
        logger.debug(`Processed ${endI}/${conceptList.length} concepts, added ${edgesAdded} similarity edges`);
      }
    }
    
    logger.info(`Added ${edgesAdded} concept similarity edges`);
  }

  addOptimizedSimilarityEdges(concepts, conceptList, maxComparisons) {
    // For very large concept sets, only compare high-frequency concepts
    // and concepts within the same category
    
    // Sort concepts by frequency/importance
    const sortedConcepts = conceptList
      .map(key => ({
        key,
        concept: concepts.get(key),
        frequency: concepts.get(key).totalWeight || 0
      }))
      .sort((a, b) => b.frequency - a.frequency);
    
    // Only process top concepts and group by category
    const topConceptCount = Math.min(200, sortedConcepts.length);
    const topConcepts = sortedConcepts.slice(0, topConceptCount);
    
    // Group by category for more efficient comparison
    const conceptsByCategory = new Map();
    for (const item of topConcepts) {
      const category = item.concept.category || 'general';
      if (!conceptsByCategory.has(category)) {
        conceptsByCategory.set(category, []);
      }
      conceptsByCategory.get(category).push(item);
    }
    
    let edgesAdded = 0;
    let comparisons = 0;
    
    // Compare concepts within the same category first
    for (const [category, categoryItems] of conceptsByCategory) {
      for (let i = 0; i < categoryItems.length; i++) {
        for (let j = i + 1; j < categoryItems.length; j++) {
          if (comparisons >= maxComparisons) break;
          
          const item1 = categoryItems[i];
          const item2 = categoryItems[j];
          
          const similarity = this.calculateConceptSimilarity(item1.concept, item2.concept);
          
          if (similarity > 0.3) {
            const node1Id = this.getConceptNodeId(item1.key);
            const node2Id = this.getConceptNodeId(item2.key);
            
            if (this.addEdge(node1Id, node2Id, this.edgeTypes.SIMILAR, {
              weight: similarity,
              similarity
            })) {
              edgesAdded++;
            }
          }
          
          comparisons++;
        }
        if (comparisons >= maxComparisons) break;
      }
      if (comparisons >= maxComparisons) break;
    }
    
    logger.info(`Added ${edgesAdded} concept similarity edges (optimized, ${comparisons} comparisons)`);
  }

  calculateConceptSimilarity(concept1, concept2) {
    // Calculate similarity based on shared files and categories
    const files1 = concept1.files;
    const files2 = concept2.files;
    const intersection = new Set([...files1].filter(x => files2.has(x)));
    const union = new Set([...files1, ...files2]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Bonus for same category
    const categoryBonus = (concept1.category === concept2.category) ? 0.2 : 0;
    
    // Bonus for same type
    const typeBonus = (concept1.type === concept2.type) ? 0.1 : 0;
    
    return jaccardSimilarity + categoryBonus + typeBonus;
  }

  resolveInternalLink(linkPath, documents) {
    // Try to find the target document
    for (const [filePath, document] of documents) {
      if (document.relativePath === linkPath || 
          document.relativePath.endsWith(linkPath) ||
          filePath.endsWith(linkPath)) {
        return filePath;
      }
    }
    return null;
  }

  addEdge(source, target, type, attributes = {}) {
    if (!this.graph.hasNode(source) || !this.graph.hasNode(target)) {
      return false;
    }
    
    // Prevent self-loops
    if (source === target) {
      return false;
    }
    
    const edgeKey = `${source}_${target}_${type}`;
    
    if (!this.graph.hasEdge(source, target)) {
      this.graph.addEdge(source, target, {
        id: edgeKey,
        type,
        source,
        target,
        ...attributes
      });
      return true;
    }
    
    return false;
  }

  getDocumentNodeId(filePath) {
    // Use a hash of the filepath for more reliable unique IDs
    const hash = crypto.createHash('md5').update(filePath).digest('hex');
    return `doc_${hash.slice(0, 16)}`;
  }

  getConceptNodeId(conceptKey) {
    const hash = crypto.createHash('md5').update(conceptKey).digest('hex');
    return `concept_${hash.slice(0, 16)}`;
  }

  getDirectoryNodeId(dirPath) {
    const hash = crypto.createHash('md5').update(dirPath).digest('hex');
    return `dir_${hash.slice(0, 16)}`;
  }

  getNodeColor(nodeType) {
    const colors = {
      [this.nodeTypes.DOCUMENT]: '#3498db',
      [this.nodeTypes.CONCEPT]: '#e74c3c',
      [this.nodeTypes.SECTION]: '#9b59b6',
      [this.nodeTypes.DIRECTORY]: '#f39c12',
      [this.nodeTypes.TAG]: '#2ecc71',
      [this.nodeTypes.NAVIGATION_ROOT]: '#ff9800'  // Orange/gold for navigation root
    };
    return colors[nodeType] || '#95a5a6';
  }

  getConceptColor(conceptType, category) {
    const colors = {
      domain: '#e74c3c',
      technical: '#3498db',
      entity: '#9b59b6',
      phrase: '#f39c12',
      noun: '#2ecc71'
    };
    
    // Category-specific colors for domain concepts
    if (conceptType === 'domain') {
      const categoryColors = {
        blockchain: '#e74c3c',
        arbitrum: '#ff6b35',
        technical: '#3498db',
        development: '#2ecc71'
      };
      return categoryColors[category] || colors.domain;
    }
    
    return colors[conceptType] || '#95a5a6';
  }

  addNavigationRootNode(sidebarData) {
    logger.subsection('Adding navigation root node');
    
    const nodeId = 'navigation_root';
    
    // Skip if node already exists
    if (this.graph.hasNode(nodeId)) {
      return;
    }
    
    // Calculate navigation metrics
    const metrics = sidebarData.metrics || {};
    const structure = sidebarData.structure || new Map();
    
    // Calculate total unique documents in navigation
    let totalNavigationDocs = 0;
    let totalCategories = 0;
    let totalExternalLinks = 0;
    const allSidebarEntries = [];
    
    for (const [sidebarKey, sidebarStructure] of structure.entries()) {
      totalNavigationDocs += sidebarStructure.documents?.size || 0;
      totalCategories += sidebarStructure.categories?.size || 0;
      totalExternalLinks += sidebarStructure.links?.size || 0;
      allSidebarEntries.push({
        key: sidebarKey,
        title: sidebarStructure.title,
        documentCount: sidebarStructure.documents?.size || 0
      });
    }
    
    this.graph.addNode(nodeId, {
      id: nodeId,
      type: this.nodeTypes.NAVIGATION_ROOT,
      label: 'sidebars.js (Navigation Root)',
      filePath: 'sidebars.js',
      description: 'Master navigation configuration that defines the documentation structure and entry points',
      
      // Navigation statistics
      totalSidebars: metrics.totalSidebars || structure.size,
      totalEntries: metrics.totalEntries || 0,
      totalDocuments: metrics.totalDocuments || totalNavigationDocs,
      totalCategories: metrics.totalCategories || totalCategories,
      totalLinks: metrics.totalLinks || totalExternalLinks,
      maxDepth: metrics.maxDepth || 0,
      orphanedEntries: metrics.orphanedEntries || 0,
      
      // Sidebar breakdown
      sidebars: allSidebarEntries,
      
      // Coverage statistics
      documentsCovered: sidebarData.documentPaths?.size || 0,
      coveragePercentage: 0, // Will be calculated after documents are added
      
      // Visual properties
      size: 2.5, // Larger size to emphasize importance
      color: this.getNodeColor(this.nodeTypes.NAVIGATION_ROOT),
      shape: 'star', // Distinctive shape
      
      // Centrality hint
      isRoot: true,
      isCentralHub: true
    });
    
    logger.info(`Added navigation root node with ${metrics.totalSidebars || structure.size} sidebars and ${totalNavigationDocs} documents`);
  }
  
  connectNavigationRoot(sidebarData, documents) {
    logger.subsection('Connecting navigation root to entry points');
    
    const navigationRootId = 'navigation_root';
    
    if (!this.graph.hasNode(navigationRootId)) {
      logger.warn('Navigation root node not found, skipping connections');
      return;
    }
    
    const structure = sidebarData.structure || new Map();
    let connectedDocuments = 0;
    let connectedCategories = 0;
    
    // Track all entry points
    const entryPoints = new Set();
    
    // Connect to top-level entries in each sidebar
    for (const [sidebarKey, sidebarStructure] of structure.entries()) {
      const entries = sidebarStructure.entries || [];
      
      // Process top-level entries (first 3-5 items are usually key entry points)
      const topLevelEntries = entries.slice(0, Math.min(5, entries.length));
      
      for (const entry of topLevelEntries) {
        if (entry.type === 'doc' && entry.documentId) {
          // Find the corresponding document node
          const docNodeId = this.findDocumentNodeByPath(documents, entry.documentId);
          if (docNodeId) {
            this.addEdge(navigationRootId, docNodeId, this.edgeTypes.NAVIGATION_ENTRY, {
              weight: 2.0,
              sidebar: sidebarKey,
              entryType: 'document',
              label: entry.label,
              isTopLevel: true
            });
            entryPoints.add(docNodeId);
            connectedDocuments++;
          }
        } else if (entry.type === 'category') {
          // Connect to category landing pages if they exist
          if (entry.linkDocumentId) {
            const docNodeId = this.findDocumentNodeByPath(documents, entry.linkDocumentId);
            if (docNodeId) {
              this.addEdge(navigationRootId, docNodeId, this.edgeTypes.NAVIGATION_ENTRY, {
                weight: 2.0,
                sidebar: sidebarKey,
                entryType: 'category_landing',
                categoryLabel: entry.label,
                isTopLevel: true
              });
              entryPoints.add(docNodeId);
              connectedCategories++;
            }
          }
          
          // Also connect to first documents in important categories
          if (entry.items && entry.items.length > 0) {
            const firstDoc = entry.items.find(item => item.type === 'doc');
            if (firstDoc && firstDoc.documentId) {
              const docNodeId = this.findDocumentNodeByPath(documents, firstDoc.documentId);
              if (docNodeId) {
                this.addEdge(navigationRootId, docNodeId, this.edgeTypes.DEFINES_NAVIGATION, {
                  weight: 1.5,
                  sidebar: sidebarKey,
                  entryType: 'category_first_doc',
                  categoryLabel: entry.label,
                  documentLabel: firstDoc.label
                });
                entryPoints.add(docNodeId);
              }
            }
          }
        }
      }
    }
    
    // Update navigation root node with coverage information
    const totalDocuments = Array.from(documents.values()).length;
    this.graph.mergeNodeAttributes(navigationRootId, {
      connectedEntryPoints: entryPoints.size,
      coveragePercentage: ((sidebarData.documentPaths?.size || 0) / totalDocuments * 100).toFixed(1)
    });
    
    logger.info(`Connected navigation root to ${entryPoints.size} entry points (${connectedDocuments} documents, ${connectedCategories} category landing pages)`);
  }
  
  findDocumentNodeByPath(documents, documentId) {
    // Try to find document by various path patterns
    for (const [filePath, document] of documents) {
      // Check if the document's relative path matches the documentId
      if (document.relativePath) {
        // Remove 'docs/' prefix and extension for comparison
        const normalizedPath = document.relativePath
          .replace(/^docs\//, '')
          .replace(/\.(mdx?|md)$/, '');
        
        if (normalizedPath === documentId) {
          return this.getDocumentNodeId(filePath);
        }
      }
      
      // Check if the file path ends with the documentId
      const normalizedFilePath = filePath
        .replace(/\.(mdx?|md)$/, '');
      
      if (normalizedFilePath.endsWith(documentId)) {
        return this.getDocumentNodeId(filePath);
      }
      
      // Check if navigation data matches
      if (document.navigation?.documentId === documentId) {
        return this.getDocumentNodeId(filePath);
      }
    }
    
    return null;
  }
  
  calculateStats() {
    this.stats.totalNodes = this.graph.order;
    this.stats.totalEdges = this.graph.size;
    
    // Count nodes by type
    this.graph.forEachNode((node, attributes) => {
      const type = attributes.type;
      this.stats.nodesByType[type] = (this.stats.nodesByType[type] || 0) + 1;
    });
    
    // Count edges by type
    this.graph.forEachEdge((edge, attributes) => {
      const type = attributes.type;
      this.stats.edgesByType[type] = (this.stats.edgesByType[type] || 0) + 1;
    });
  }

  getStats() {
    return {
      ...this.stats,
      density: this.graph.size / (this.graph.order * (this.graph.order - 1)),
      avgDegree: this.graph.size * 2 / this.graph.order
    };
  }

  exportGraph() {
    const exportData = {
      nodes: [],
      edges: []
    };
    
    this.graph.forEachNode((node, attributes) => {
      exportData.nodes.push({ id: node, ...attributes });
    });
    
    this.graph.forEachEdge((edge, attributes, source, target) => {
      exportData.edges.push({ id: edge, source, target, ...attributes });
    });
    
    return exportData;
  }
}

export default GraphBuilder;