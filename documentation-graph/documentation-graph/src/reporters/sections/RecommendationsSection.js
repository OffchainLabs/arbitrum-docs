/**
 * RecommendationsSection - Generates recommendations
 */
export default class RecommendationsSection {
  constructor(config = {}) {
    this.config = config;
  }

  getTitle() {
    return 'Recommendations';
  }

  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);
    builder.addParagraph('Recommendations will be implemented in a future phase.');
    return builder;
  }
}
