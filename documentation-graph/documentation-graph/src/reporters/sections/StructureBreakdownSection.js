/**
 * StructureBreakdownSection - Generates structure breakdown
 */
export default class StructureBreakdownSection {
  constructor(config = {}) {
    this.config = config;
  }

  getTitle() {
    return 'Structure breakdown';
  }

  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);
    builder.addParagraph('Structure breakdown will be implemented in a future phase.');
    return builder;
  }
}
