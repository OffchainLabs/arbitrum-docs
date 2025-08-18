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

// Formatting helper function
async function formatContent(content: string, filepath: string): Promise<string> {
  try {
    const prettier = require('prettier')
    const options = await prettier.resolveConfig(process.cwd()) || {}
    
    const parser = filepath.endsWith('.json') ? 'json' : 'markdown'
    
    return prettier.format(content, {
      ...options,
      parser,
      filepath,
    })
  } catch (error) {
    console.warn(`⚠️ Prettier formatting failed for ${filepath}, using content as-is:`, error)
    return content
  }
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
  const formattedGlossaryJSON = await formatContent(glossaryJSON, 'static/glossary.json')
  fs.writeFileSync('static/glossary.json', formattedGlossaryJSON)
  const definitionsHTML = `\n\n${renderGlossary(
    validGlossaryTerms,
    linkableTerms
  )}\n`
  const formattedDefinitionsHTML = await formatContent(definitionsHTML, 'docs/partials/_glossary-partial.mdx')
  fs.writeFileSync('docs/partials/_glossary-partial.mdx', formattedDefinitionsHTML)

  // FAQs
  // ----
  // Get started
  const getStartedFAQsJSON = renderJSONFAQStructuredData(cmsContents.getStartedFAQs)
  const formattedGetStartedFAQsJSON = await formatContent(getStartedFAQsJSON, 'static/get-started-faqs.json')
  fs.writeFileSync(
    'static/get-started-faqs.json',
    formattedGetStartedFAQsJSON
  )
  const getStartedFAQsHTML = renderFAQs(cmsContents.getStartedFAQs)
  const formattedGetStartedFAQsHTML = await formatContent(getStartedFAQsHTML, 'docs/partials/_troubleshooting-users-partial.mdx')
  fs.writeFileSync(
    'docs/partials/_troubleshooting-users-partial.mdx',
    formattedGetStartedFAQsHTML
  )

  // Node running
  const nodeRunningFAQsJSON = renderJSONFAQStructuredData(cmsContents.nodeRunningFAQs)
  const formattedNodeRunningFAQsJSON = await formatContent(nodeRunningFAQsJSON, 'static/node-running-faqs.json')
  fs.writeFileSync(
    'static/node-running-faqs.json',
    formattedNodeRunningFAQsJSON
  )
  const nodeRunningFAQsHTML = renderFAQs(cmsContents.nodeRunningFAQs)
  const formattedNodeRunningFAQsHTML = await formatContent(nodeRunningFAQsHTML, 'docs/partials/_troubleshooting-nodes-partial.mdx')
  fs.writeFileSync(
    'docs/partials/_troubleshooting-nodes-partial.mdx',
    formattedNodeRunningFAQsHTML
  )

  // Building
  const buildingFAQsJSON = renderJSONFAQStructuredData(cmsContents.buildingFAQs)
  const formattedBuildingFAQsJSON = await formatContent(buildingFAQsJSON, 'static/building-faqs.json')
  fs.writeFileSync(
    'static/building-faqs.json',
    formattedBuildingFAQsJSON
  )
  const buildingFAQsHTML = renderFAQs(cmsContents.buildingFAQs)
  const formattedBuildingFAQsHTML = await formatContent(buildingFAQsHTML, 'docs/partials/_troubleshooting-building-partial.mdx')
  fs.writeFileSync(
    'docs/partials/_troubleshooting-building-partial.mdx',
    formattedBuildingFAQsHTML
  )

  // Stylus
  const stylusFAQsJSON = renderJSONFAQStructuredData(cmsContents.buildingStylusFAQs)
  const formattedStylusFAQsJSON = await formatContent(stylusFAQsJSON, 'static/building-stylus-faqs.json')
  fs.writeFileSync(
    'static/building-stylus-faqs.json',
    formattedStylusFAQsJSON
  )
  const stylusFAQsHTML = renderFAQs(cmsContents.buildingStylusFAQs)
  const formattedStylusFAQsHTML = await formatContent(stylusFAQsHTML, 'docs/partials/_troubleshooting-stylus-partial.mdx')
  fs.writeFileSync(
    'docs/partials/_troubleshooting-stylus-partial.mdx',
    formattedStylusFAQsHTML
  )

  // Orbit
  const orbitFAQsJSON = renderJSONFAQStructuredData(cmsContents.orbitFAQs)
  const formattedOrbitFAQsJSON = await formatContent(orbitFAQsJSON, 'static/building-orbit-faqs.json')
  fs.writeFileSync(
    'static/building-orbit-faqs.json',
    formattedOrbitFAQsJSON
  )
  const orbitFAQsHTML = renderFAQs(cmsContents.orbitFAQs)
  const formattedOrbitFAQsHTML = await formatContent(orbitFAQsHTML, 'docs/partials/_troubleshooting-arbitrum-chain-partial.mdx')
  fs.writeFileSync(
    'docs/partials/_troubleshooting-arbitrum-chain-partial.mdx',
    formattedOrbitFAQsHTML
  )

  // Bridging
  const bridgingFAQsJSON = renderJSONFAQStructuredData(cmsContents.bridgingFAQs)
  const formattedBridgingFAQsJSON = await formatContent(bridgingFAQsJSON, 'static/bridging-faqs.json')
  fs.writeFileSync(
    'static/bridging-faqs.json',
    formattedBridgingFAQsJSON
  )
  const bridgingFAQsHTML = renderFAQs(cmsContents.bridgingFAQs)
  const formattedBridgingFAQsHTML = await formatContent(bridgingFAQsHTML, 'docs/partials/_troubleshooting-bridging-partial.mdx')
  fs.writeFileSync(
    'docs/partials/_troubleshooting-bridging-partial.mdx',
    formattedBridgingFAQsHTML
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
