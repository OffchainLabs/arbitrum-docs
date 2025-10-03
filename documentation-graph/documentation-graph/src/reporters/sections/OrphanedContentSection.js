/**
 * OrphanedContentSection - Generates orphaned content analysis
 */
export default class OrphanedContentSection {
  constructor(config = {}) {
    this.config = config;
  }

  getTitle() {
    return 'Orphaned content';
  }

  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);
    builder.addParagraph('Orphaned content analysis will be implemented in a future phase.');
    return builder;
  }
}
