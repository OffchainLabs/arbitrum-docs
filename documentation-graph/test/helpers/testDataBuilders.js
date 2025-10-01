/**
 * Test Data Builders - Fluent API for creating test data
 *
 * Provides reusable builders to create documents, concepts, and analysis objects
 * with sensible defaults and easy customization.
 */

/**
 * Document Builder - creates document objects with fluent API
 */
export class DocumentBuilder {
  constructor() {
    this.doc = {
      path: 'docs/test.mdx',
      frontmatter: { content_type: 'how-to' },
      wordCount: 500,
      links: { internal: [], external: [], anchor: [] },
    };
  }

  withPath(path) {
    this.doc.path = path;
    return this;
  }

  withContentType(contentType) {
    if (!this.doc.frontmatter) this.doc.frontmatter = {};
    this.doc.frontmatter.content_type = contentType;
    return this;
  }

  withWordCount(count) {
    this.doc.wordCount = count;
    return this;
  }

  withoutFrontmatter() {
    this.doc.frontmatter = null;
    return this;
  }

  withInternalLinks(links) {
    this.doc.links.internal = Array.isArray(links) ? links : [links];
    return this;
  }

  build() {
    return { ...this.doc };
  }
}

/**
 * Documents Map Builder - creates Map of documents
 */
export class DocumentsMapBuilder {
  constructor() {
    this.documents = new Map();
  }

  addDocument(doc) {
    this.documents.set(doc.path, doc);
    return this;
  }

  addDocumentWithBuilder(builderFn) {
    const doc = builderFn(new DocumentBuilder()).build();
    this.documents.set(doc.path, doc);
    return this;
  }

  addMultiple(count, basePath = 'docs/test', contentType = 'how-to') {
    for (let i = 0; i < count; i++) {
      const doc = new DocumentBuilder()
        .withPath(`${basePath}-${i}.mdx`)
        .withContentType(contentType)
        .build();
      this.documents.set(doc.path, doc);
    }
    return this;
  }

  build() {
    return this.documents;
  }
}

/**
 * Concept Builder - creates concept objects
 */
export class ConceptBuilder {
  constructor(text) {
    this.concept = {
      text,
      type: 'technical',
      category: 'blockchain',
      files: new Set(),
      totalWeight: 10,
    };
  }

  withType(type) {
    this.concept.type = type;
    return this;
  }

  withCategory(category) {
    this.concept.category = category;
    return this;
  }

  withFiles(files) {
    this.concept.files = new Set(files);
    return this;
  }

  withWeight(weight) {
    this.concept.totalWeight = weight;
    return this;
  }

  build() {
    return { ...this.concept, files: new Set(this.concept.files) };
  }
}

/**
 * Concept Data Builder - creates complete concept data structure
 */
export class ConceptDataBuilder {
  constructor() {
    this.concepts = new Map();
    this.frequency = new Map();
    this.cooccurrence = new Map();
  }

  addConcept(text, builderFn = null) {
    const builder = new ConceptBuilder(text);
    const concept = builderFn ? builderFn(builder).build() : builder.build();
    this.concepts.set(text, concept);
    this.frequency.set(text, concept.totalWeight);
    return this;
  }

  withCooccurrence(concept1, concept2, count) {
    if (!this.cooccurrence.has(concept1)) {
      this.cooccurrence.set(concept1, new Map());
    }
    this.cooccurrence.get(concept1).set(concept2, count);
    return this;
  }

  build() {
    return {
      concepts: this.concepts,
      frequency: this.frequency,
      cooccurrence: this.cooccurrence,
    };
  }
}

/**
 * Analysis Builder - creates analysis objects
 */
export class AnalysisBuilder {
  constructor() {
    this.analysis = {
      basic: {
        nodesByType: { document: 0, concept: 0 },
        edgesByType: { 'contains': 0, 'links-to': 0 },
      },
      documents: {
        total: 0,
        byDirectory: {},
        byType: {},
        hubs: [],
        orphans: [],
      },
      navigation: {
        available: true,
        metrics: { totalEntries: 0 },
        coverage: { coveragePercentage: '0%' },
      },
      quality: {
        overallScore: 70,
        issues: [],
        strengths: [],
      },
      recommendations: [],
    };
  }

  withDocumentCount(count) {
    this.analysis.documents.total = count;
    this.analysis.basic.nodesByType.document = count;
    return this;
  }

  withQualityScore(score) {
    this.analysis.quality.overallScore = score;
    return this;
  }

  withDirectoryDistribution(distribution) {
    this.analysis.documents.byDirectory = { ...distribution };
    return this;
  }

  build() {
    return this.analysis;
  }
}

/**
 * Quick factory functions for common test data
 */
export const testData = {
  /**
   * Create a simple documents Map with specified count and content type
   */
  createDocuments(count = 5, contentType = 'how-to') {
    return new DocumentsMapBuilder().addMultiple(count, 'docs/test', contentType).build();
  },

  /**
   * Create concept data with specified concepts
   */
  createConcepts(concepts = ['arbitrum', 'transaction', 'smart contract']) {
    const builder = new ConceptDataBuilder();
    concepts.forEach((concept) => builder.addConcept(concept));
    return builder.build();
  },

  /**
   * Create basic analysis object
   */
  createAnalysis(documentCount = 10, qualityScore = 70) {
    return new AnalysisBuilder()
      .withDocumentCount(documentCount)
      .withQualityScore(qualityScore)
      .build();
  },
};
