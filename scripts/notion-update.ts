import { Client } from '@notionhq/client';
import {
  FAQ,
  RenderedKnowledgeItem,
  renderKnowledgeItem,
  lookupProject,
  lookupFAQs,
  handleRenderError,
  Record,
  KnowledgeItem,
  LinkableTerms,
  LinkValidity,
  RenderMode,
  Question,
  QuestionType,
  lookupQuestions,
  renderRichTexts,
} from '@offchainlabs/notion-docs-generator';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Local implementation of escapeForJSON utility
function escapeForJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Escape special characters for MDX (curly braces and angle brackets are JSX expressions in MDX)
function escapeForMDX(str: string): string {
  return str.replace(/{/g, '\\{').replace(/}/g, '\\}').replace(/</g, '\\<').replace(/>/g, '\\>');
}

// Helper to convert question text to URL-safe key
function generateQuestionKey(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Helper to render a single Question to RenderedQuestion
function renderQuestion(question: Question, linkableTerms: LinkableTerms): RenderedQuestion {
  const questionText = renderRichTexts(question.question, linkableTerms, RenderMode.Plain).trim();

  const answerText = renderRichTexts(question.answer, linkableTerms, RenderMode.Markdown).trim();

  return {
    question: questionText,
    answer: answerText,
    key: generateQuestionKey(questionText),
  };
}

// Rendered question type (similar to RenderedKnowledgeItem but for questions)
type RenderedQuestion = {
  question: string; // Plain text question
  answer: string; // Markdown formatted answer
  key: string; // URL-safe key
};

// Types
type CMSContents = {
  getStartedFAQs: RenderedKnowledgeItem[];
  nodeRunningFAQs: RenderedKnowledgeItem[];
  buildingFAQs: RenderedKnowledgeItem[];
  buildingStylusFAQs: RenderedKnowledgeItem[];
  orbitFAQs: RenderedKnowledgeItem[];
  bridgingFAQs: RenderedKnowledgeItem[];
  miscellaneousQuestions: RenderedQuestion[];
};

// Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Helper functions
export function recordValidity(record: Record): LinkValidity {
  if (record.status != '4 - Continuously publishing') {
    return { reason: 'page not yet marked as ready' };
  }
  if (record.publishable != 'Publishable') {
    return { reason: 'page not marked as publishable' };
  }
  return 'Valid';
}
const isValid = (item: KnowledgeItem) => {
  return recordValidity(item) === 'Valid';
};

// Content getter
const getContentFromCMS = async (): Promise<CMSContents> => {
  const devDocsV2Project = await lookupProject(notion, 'Arbitrum developer docs portal v2.0');

  const getStartedFAQs = await lookupFAQs(notion, {
    filter: {
      and: [
        {
          property: 'Target document slugs',
          multi_select: {
            contains: 'troubleshooting-using-arbitrum',
          },
        },
        {
          property: 'Publishable?',
          select: {
            equals: 'Publishable',
          },
        },
      ],
    },
    sorts: [
      {
        property: 'FAQ order index',
        direction: 'ascending',
      },
    ],
  });

  const nodeRunningFAQs = await lookupFAQs(notion, {
    filter: {
      and: [
        {
          property: 'Target document slugs',
          multi_select: {
            contains: 'troubleshooting-running-nodes',
          },
        },
        {
          property: 'Publishable?',
          select: {
            equals: 'Publishable',
          },
        },
      ],
    },
    sorts: [
      {
        property: 'FAQ order index',
        direction: 'ascending',
      },
    ],
  });

  const buildingFAQs = await lookupFAQs(notion, {
    filter: {
      and: [
        {
          property: 'Target document slugs',
          multi_select: {
            contains: 'troubleshooting-building',
          },
        },
        {
          property: 'Publishable?',
          select: {
            equals: 'Publishable',
          },
        },
      ],
    },
    sorts: [
      {
        property: 'FAQ order index',
        direction: 'ascending',
      },
    ],
  });

  const buildingStylusFAQs = await lookupFAQs(notion, {
    filter: {
      and: [
        {
          property: 'Target document slugs',
          multi_select: {
            contains: 'troubleshooting-building-stylus',
          },
        },
        {
          property: 'Publishable?',
          select: {
            equals: 'Publishable',
          },
        },
      ],
    },
    sorts: [
      {
        property: 'FAQ order index',
        direction: 'ascending',
      },
    ],
  });

  const orbitFAQs = await lookupFAQs(notion, {
    filter: {
      and: [
        {
          property: 'Target document slugs',
          multi_select: {
            contains: 'troubleshooting-building-orbit',
          },
        },
        {
          property: 'Publishable?',
          select: {
            equals: 'Publishable',
          },
        },
      ],
    },
    sorts: [
      {
        property: 'FAQ order index',
        direction: 'ascending',
      },
    ],
  });

  const bridgingFAQs = await lookupFAQs(notion, {
    filter: {
      and: [
        {
          property: 'Target document slugs',
          multi_select: {
            contains: 'troubleshooting-bridging',
          },
        },
        {
          property: 'Publishable?',
          select: {
            equals: 'Publishable',
          },
        },
      ],
    },
    sorts: [
      {
        property: 'FAQ order index',
        direction: 'ascending',
      },
    ],
  });

  const miscellaneousQuestions = await lookupQuestions(notion, {
    // No filter - include ALL questions regardless of status or type
    // No sorts - no specific ordering
  });

  // Render questions and filter out any that fail to render
  const renderedQuestions: RenderedQuestion[] = [];
  for (const question of miscellaneousQuestions) {
    try {
      renderedQuestions.push(renderQuestion(question, {}));
    } catch (error) {
      console.error(`Failed to render question ${question.id}:`, error);
      // Skip questions that fail to render (e.g., contain unsupported links)
    }
  }

  return {
    getStartedFAQs: getStartedFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {}, RenderMode.Markdown)),
    nodeRunningFAQs: nodeRunningFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {}, RenderMode.Markdown)),
    buildingFAQs: buildingFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {}, RenderMode.Markdown)),
    buildingStylusFAQs: buildingStylusFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {}, RenderMode.Markdown)),
    orbitFAQs: orbitFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {}, RenderMode.Markdown)),
    bridgingFAQs: bridgingFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {}, RenderMode.Markdown)),
    miscellaneousQuestions: renderedQuestions,
  };
};

// Renderer for FAQs structured data in JSON
const renderJSONFAQStructuredData = (faqs: RenderedKnowledgeItem[]) => {
  const printItem = (faq: RenderedKnowledgeItem) => {
    const faqQuestion = escapeForJSON(faq.titleforSort);
    const faqAnswer = escapeForJSON(faq.text);
    const faqKey = escapeForJSON(faq.key);
    return `{"question": "${faqQuestion}","answer": "${faqAnswer}","key": "${faqKey}"}`;
  };

  return '[\n' + faqs.map(printItem).join(',\n') + '\n]';
};

// Renderer for FAQ questions and answers
const renderFAQs = (faqs: RenderedKnowledgeItem[]) => {
  const printItem = (faq: RenderedKnowledgeItem) => {
    return `### ${faq.title}` + '\n' + `${faq.text}`;
  };

  return faqs.map(printItem).join('\n\n');
};

// Renderer for Questions in MDX format
const renderQuestions = (questions: RenderedQuestion[]): string => {
  const printItem = (q: RenderedQuestion) => {
    // Escape MDX special characters (curly braces) that would be interpreted as JSX
    const escapedQuestion = escapeForMDX(q.question);
    const escapedAnswer = escapeForMDX(q.answer);
    return `### ${escapedQuestion}\n\n${escapedAnswer}`;
  };

  return questions.map(printItem).join('\n\n');
};

// Renderer for Questions structured data in JSON
const renderJSONQuestionStructuredData = (questions: RenderedQuestion[]): string => {
  const printItem = (q: RenderedQuestion) => {
    const questionText = escapeForJSON(q.question);
    const answerText = escapeForJSON(q.answer);
    const questionKey = escapeForJSON(q.key);
    return `{"question": "${questionText}","answer": "${answerText}","key": "${questionKey}"}`;
  };

  return '[\n' + questions.map(printItem).join(',\n') + '\n]';
};

async function generateFiles() {
  const linkableTerms: LinkableTerms = {};

  // Getting content from the CMS
  const cmsContents = await getContentFromCMS();

  // Glossary
  // --------
  const addItems = (items: KnowledgeItem[], page: string) => {
    for (const item of items) {
      linkableTerms[item.pageId] = {
        text: item.title,
        anchor: item.title,
        page: page,
        valid: recordValidity(item),
        notionURL: item.url,
      };
    }
  };

  // FAQs
  // ----
  // Get started
  fs.writeFileSync(
    'static/get-started-faqs.json',
    renderJSONFAQStructuredData(cmsContents.getStartedFAQs),
  );
  fs.writeFileSync(
    'docs/partials/_troubleshooting-users-partial.mdx',
    renderFAQs(cmsContents.getStartedFAQs),
  );

  // Node running
  fs.writeFileSync(
    'static/node-running-faqs.json',
    renderJSONFAQStructuredData(cmsContents.nodeRunningFAQs),
  );
  fs.writeFileSync(
    'docs/partials/_troubleshooting-nodes-partial.mdx',
    renderFAQs(cmsContents.nodeRunningFAQs),
  );

  // Building
  fs.writeFileSync(
    'static/building-faqs.json',
    renderJSONFAQStructuredData(cmsContents.buildingFAQs),
  );
  fs.writeFileSync(
    'docs/partials/_troubleshooting-building-partial.mdx',
    renderFAQs(cmsContents.buildingFAQs),
  );

  // Stylus
  fs.writeFileSync(
    'static/building-stylus-faqs.json',
    renderJSONFAQStructuredData(cmsContents.buildingStylusFAQs),
  );
  fs.writeFileSync(
    'docs/partials/_troubleshooting-stylus-partial.mdx',
    renderFAQs(cmsContents.buildingStylusFAQs),
  );

  // Orbit
  fs.writeFileSync(
    'static/building-orbit-faqs.json',
    renderJSONFAQStructuredData(cmsContents.orbitFAQs),
  );
  fs.writeFileSync(
    'docs/partials/_troubleshooting-arbitrum-chain-partial.mdx',
    renderFAQs(cmsContents.orbitFAQs),
  );

  // Bridging
  fs.writeFileSync(
    'static/bridging-faqs.json',
    renderJSONFAQStructuredData(cmsContents.bridgingFAQs),
  );
  fs.writeFileSync(
    'docs/partials/_troubleshooting-bridging-partial.mdx',
    renderFAQs(cmsContents.bridgingFAQs),
  );

  // Miscellaneous Questions
  fs.writeFileSync(
    'static/miscellaneous-qa.json',
    renderJSONQuestionStructuredData(cmsContents.miscellaneousQuestions),
  );
  fs.writeFileSync(
    'docs/partials/_miscellaneous-QA.mdx',
    renderQuestions(cmsContents.miscellaneousQuestions),
  );
}

async function main() {
  try {
    await generateFiles();
  } catch (e: unknown) {
    if (await handleRenderError(e, notion)) {
      process.exit(1);
    }
    throw e;
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
