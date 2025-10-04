/**
 * QueryParser - Natural language query parsing and filtering
 *
 * Parses natural language queries to extract filters and search criteria
 */

export class QueryParser {
  constructor(documents, concepts) {
    this.documents = documents;
    this.concepts = concepts;
  }

  /**
   * Parse natural language query into structured filters
   * Examples:
   * - "Show me all docs about Gas optimization"
   * - "Find all quickstarts with >70% similarity"
   * - "Show hub documents (>10 connections)"
   * - "Orphaned concept docs in the DAO section"
   */
  parseQuery(query) {
    const filters = {
      concept: null,
      contentType: null,
      directory: null,
      similarity: null,
      connections: null,
      orphaned: null,
    };

    const queryLower = query.toLowerCase();

    // Extract concept/topic
    const conceptMatch =
      queryLower.match(/about\s+([a-z\s]+?)(?:\s|$)/i) ||
      queryLower.match(/for\s+([a-z\s]+?)(?:\s|$)/i) ||
      queryLower.match(/regarding\s+([a-z\s]+?)(?:\s|$)/i);

    if (conceptMatch) {
      filters.concept = conceptMatch[1].trim();
    }

    // Extract content type
    const contentTypes = [
      'quickstart',
      'how-to',
      'concept',
      'tutorial',
      'reference',
      'troubleshooting',
      'gentle-introduction',
    ];
    for (const type of contentTypes) {
      if (queryLower.includes(type)) {
        filters.contentType = type;
        break;
      }
    }

    // Extract similarity threshold
    const similarityMatch = queryLower.match(/(\d+)%\s+similarity/);
    if (similarityMatch) {
      filters.similarity = parseInt(similarityMatch[1]) / 100;
    }

    // Extract connection threshold
    const connectionsMatch = queryLower.match(/>(\d+)\s+connection/);
    if (connectionsMatch) {
      filters.connections = parseInt(connectionsMatch[1]);
    }

    // Extract orphaned filter
    if (queryLower.includes('orphan')) {
      filters.orphaned = true;
    }

    // Extract directory
    const directories = [...new Set(this.documents.map((d) => d.directory))];
    for (const dir of directories) {
      if (queryLower.includes(dir.toLowerCase())) {
        filters.directory = dir;
        break;
      }
    }

    return filters;
  }

  /**
   * Apply filters to document set
   */
  applyFilters(documents, filters) {
    let filtered = [...documents];

    if (filters.contentType) {
      filtered = filtered.filter((d) => d.frontmatter?.content_type === filters.contentType);
    }

    if (filters.directory) {
      filtered = filtered.filter((d) => d.directory === filters.directory);
    }

    if (filters.orphaned !== null) {
      filtered = filtered.filter((d) => d.navigation?.isOrphaned === filters.orphaned);
    }

    return filtered;
  }

  /**
   * Search for documents matching query
   */
  searchDocuments(query) {
    const filters = this.parseQuery(query);
    const results = this.applyFilters(this.documents, filters);

    return {
      query,
      filters,
      results: results.map((d) => ({
        path: d.relativePath,
        title: d.frontmatter?.title,
        contentType: d.frontmatter?.content_type,
        directory: d.directory,
      })),
      totalResults: results.length,
    };
  }

  /**
   * Find concept by fuzzy matching
   */
  findConcept(searchTerm) {
    const searchLower = searchTerm.toLowerCase();

    // Exact match
    const exactMatch = this.concepts.topConcepts?.find(
      (c) => c.concept.toLowerCase() === searchLower,
    );
    if (exactMatch) {
      return exactMatch.concept;
    }

    // Partial match
    const partialMatches = this.concepts.topConcepts?.filter((c) =>
      c.concept.toLowerCase().includes(searchLower),
    );

    if (partialMatches && partialMatches.length > 0) {
      // Return most frequent
      partialMatches.sort((a, b) => b.frequency - a.frequency);
      return partialMatches[0].concept;
    }

    return null;
  }
}
