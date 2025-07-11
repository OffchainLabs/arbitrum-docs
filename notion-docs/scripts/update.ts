import { Client } from '@notionhq/client'
import {
  Definition,
  FAQ,
  RenderedKnowledgeItem,
  renderKnowledgeItem,
  escapeForJSON,
  lookupProject,
  lookupGlossaryTerms,
  lookupFAQs,
  handleRenderError,
  renderGlossary,
  Record,
  renderGlossaryJSON,
  KnowledgeItem,
  LinkableTerms,
  LinkValidity,
} from '@offchainlabs/notion-docs-generator'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

// Types
type CMSContents = {
  glossaryTerms: Definition[]
  getStartedFAQs: RenderedKnowledgeItem[]
  nodeRunningFAQs: RenderedKnowledgeItem[]
  buildingFAQs: RenderedKnowledgeItem[]
  buildingStylusFAQs: RenderedKnowledgeItem[]
  orbitFAQs: RenderedKnowledgeItem[]
  bridgingFAQs: RenderedKnowledgeItem[]
}

// Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Helper functions
export function recordValidity(record: Record): LinkValidity {
  if (record.status != '4 - Continuously publishing') {
    return { reason: 'page not yet marked as ready' }
  }
  if (record.publishable != 'Publishable') {
    return { reason: 'page not marked as publishable' }
  }
  return 'Valid'
}
const isValid = (item: KnowledgeItem) => {
  return recordValidity(item) === 'Valid'
}

// Content getter
const getContentFromCMS = async (): Promise<CMSContents> => {
  const devDocsV2Project = await lookupProject(
    notion,
    'Arbitrum developer docs portal v2.0'
  )

  const glossaryTerms = await lookupGlossaryTerms(notion, {
    filter: {
      property: 'Project(s)',
      relation: {
        contains: devDocsV2Project,
      },
    },
  })

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
  })

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
  })

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
  })

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
  })

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
  })

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
  })

  return {
    glossaryTerms,
    getStartedFAQs: getStartedFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {})),
    nodeRunningFAQs: nodeRunningFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {})),
    buildingFAQs: buildingFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {})),
    buildingStylusFAQs: buildingStylusFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {})),
    orbitFAQs: orbitFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {})),
    bridgingFAQs: bridgingFAQs
      .filter(isValid)
      .map((faq: FAQ) => renderKnowledgeItem(faq, {})),
  }
}

// Renderer for FAQs structured data in JSON
const renderJSONFAQStructuredData = (faqs: RenderedKnowledgeItem[]) => {
  const printItem = (faq: RenderedKnowledgeItem) => {
    const faqQuestion = escapeForJSON(faq.titleforSort)
    const faqAnswer = escapeForJSON(faq.text)
    const faqKey = escapeForJSON(faq.key)
    return `{"question": "${faqQuestion}","answer": "${faqAnswer}","key": "${faqKey}"}`
  }

  return '[\n' + faqs.map(printItem).join(',\n') + '\n]'
}

// Renderer for FAQ questions and answers
const renderFAQs = (faqs: RenderedKnowledgeItem[]) => {
  const printItem = (faq: RenderedKnowledgeItem) => {
    return `### ${faq.title}` + '\n' + `${faq.text}`
  }

  return faqs.map(printItem).join('\n')
}

async function generateFiles() {
  const linkableTerms: LinkableTerms = {}

  // Getting content from the CMS
  const cmsContents = await getContentFromCMS()

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
      }
    }
  }

  const validGlossaryTerms = cmsContents.glossaryTerms.filter(isValid)
  addItems(validGlossaryTerms, '/intro/glossary')
  const glossaryJSON = renderGlossaryJSON(validGlossaryTerms, linkableTerms)
  fs.writeFileSync('../website/static/glossary.json', glossaryJSON)
  const definitionsHTML = `\n\n${renderGlossary(
    validGlossaryTerms,
    linkableTerms
  )}\n`
  fs.writeFileSync(
    '../arbitrum-docs/partials/_glossary-partial.mdx',
    definitionsHTML
  )

  // FAQs
  // ----
  // Get started
  fs.writeFileSync(
    '../website/static/get-started-faqs.json',
    renderJSONFAQStructuredData(cmsContents.getStartedFAQs)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-users-partial.mdx',
    renderFAQs(cmsContents.getStartedFAQs)
  )

  // Node running
  fs.writeFileSync(
    '../website/static/node-running-faqs.json',
    renderJSONFAQStructuredData(cmsContents.nodeRunningFAQs)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-nodes-partial.mdx',
    renderFAQs(cmsContents.nodeRunningFAQs)
  )

  // Building
  fs.writeFileSync(
    '../website/static/building-faqs.json',
    renderJSONFAQStructuredData(cmsContents.buildingFAQs)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-building-partial.mdx',
    renderFAQs(cmsContents.buildingFAQs)
  )

  // Stylus
  fs.writeFileSync(
    '../website/static/building-stylus-faqs.json',
    renderJSONFAQStructuredData(cmsContents.buildingStylusFAQs)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-stylus-partial.mdx',
    renderFAQs(cmsContents.buildingStylusFAQs)
  )

  // Orbit
  fs.writeFileSync(
    '../website/static/building-orbit-faqs.json',
    renderJSONFAQStructuredData(cmsContents.orbitFAQs)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-arbitrum-chain-partial.mdx',
    renderFAQs(cmsContents.orbitFAQs)
  )

  // Bridging
  fs.writeFileSync(
    '../website/static/bridging-faqs.json',
    renderJSONFAQStructuredData(cmsContents.bridgingFAQs)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-bridging-partial.mdx',
    renderFAQs(cmsContents.bridgingFAQs)
  )
}

async function main() {
  try {
    await generateFiles()
  } catch (e: unknown) {
    if (await handleRenderError(e, notion)) {
      process.exit(1)
    }
    throw e
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
