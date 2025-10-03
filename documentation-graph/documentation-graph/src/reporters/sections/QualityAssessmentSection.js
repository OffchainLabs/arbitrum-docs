/**
 * QualityAssessmentSection - Generates quality assessment
 */
export default class QualityAssessmentSection {
  constructor(config = {}) {
    this.config = config;
  }

  getTitle() {
    return 'Quality assessment';
  }

  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);
    builder.addParagraph('Quality assessment will be implemented in a future phase.');
    return builder;
  }
}
