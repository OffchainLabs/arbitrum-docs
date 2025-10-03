/**
 * HubDocumentsSection - Generates hub documents analysis
 */
export default class HubDocumentsSection {
  constructor(config = {}) {
    this.config = config;
  }

  getTitle() {
    return 'Hub documents';
  }

  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);
    builder.addParagraph('Hub documents analysis will be implemented in a future phase.');
    return builder;
  }
}
