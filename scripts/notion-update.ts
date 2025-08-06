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
import TurndownService from 'turndown'
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

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  linkStyle: 'inlined',
  bulletListMarker: '-',
})

// Configure turndown to handle MDX-specific cases
turndownService.addRule('removeEmptyParagraphs', {
  filter: (node) => {
    return (
      node.nodeName === 'P' &&
      node.textContent &&
      node.textContent.trim() === ''
    )
  },
  replacement: () => '',
})

// Escape MDX-problematic characters
turndownService.addRule('escapeMDXCharacters', {
  filter: () => false, // We'll handle this in post-processing
  replacement: () => '',
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

// Convert HTML to clean Markdown
function htmlToMarkdown(html: string): string {
  // Clean up the HTML before conversion
  let cleanHtml = html
    .replace(/\n\s*\n/g, '\n') // Remove excessive newlines
    .trim()
  
  // Convert to Markdown
  let markdown = turndownService.turndown(cleanHtml)
  
  // Post-process to clean up common issues
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    
  // Fix escaped backticks and asterisks that break MDX compilation
  markdown = markdown
    .replace(/\\`/g, '`') // Unescape backticks
    .replace(/\\\\/g, '\\') // Fix double-escaped backslashes
    .replace(/\\\*/g, '*') // Unescape asterisks used in bold formatting
  
  // Fix malformed links that can break MDX compilation
  markdown = markdown
    .replace(/\]\(<a href=[^)]*\)"/g, '](') // Remove malformed <a href= fragments
    .replace(/\[([^\]]+)\]\(<a href=([^>]*)>\)"\>\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($4)') // Fix nested link structures
    .replace(/\[([^\]]+)\]\(<a href=\)"/g, '[$1](') // Fix incomplete href attributes
    .replace(/\]\(<a href=\)"/g, '](') // Fix bare <a href= fragments
    .replace(/\[([^\]]+)\]\(>(\[.*?\]\(.*?\))\)/g, '$2') // Fix malformed nested link patterns like [text](>[text](url))
    .replace(/\[([^\]]+)\]\(>\[([^\]]+)\]\(([^)]+)\)\)/g, '[$2]($3)') // Fix specific pattern [text](>[text](url))
    .replace(/\]\(>\[/g, '][') // Fix remaining ](>[ patterns
    .replace(/\[([^\]]+)\]\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($3)') // Fix duplicate link syntax [text][text](url)
    .replace(/\*{4,}/g, '**') // Fix excessive asterisks (more than 4 becomes 2)
    .replace(/\*\*\*\*\.\*\*/g, '**.') // Fix specific pattern ****.** to **.
    .replace(/\*\*\.\*\*/g, '**.') // Fix specific pattern **.** to **.
    .replace(/\*\*\*\*/g, '**') // Fix quadruple asterisks
  
  return markdown
}

// Properly escape HTML entities for JSON
function escapeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Extract title text from Notion rich text object
function extractTitleText(title: any): string {
  if (typeof title === 'string') {
    return title
  }
  if (Array.isArray(title) && title.length > 0) {
    return title.map(item => item.plain_text || item.text?.content || '').join('')
  }
  return 'Unknown Title'
}

// Extract key from term object (use the rendered term's key)
function extractKey(renderedTerm: any): string {
  if (renderedTerm && renderedTerm.key && typeof renderedTerm.key === 'string') {
    return renderedTerm.key
  }
  return 'unknown-key'
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

// Renderer for FAQ questions and answers as pure Markdown
const renderFAQs = (faqs: RenderedKnowledgeItem[]) => {
  const printItem = (faq: RenderedKnowledgeItem) => {
    // Convert HTML content to Markdown
    const markdownText = htmlToMarkdown(faq.text)
    return `### ${faq.title}\n\n${markdownText}`
  }

  return faqs.map(printItem).join('\n\n')
}

// Custom glossary JSON renderer with proper HTML escaping
function renderGlossaryJSONWithEscaping(
  terms: Definition[], 
  linkableTerms: LinkableTerms
): string {
  const glossaryData: Record<string, {title: string, text: string}> = {}
  
  for (const term of terms) {
    const renderedTerm = renderKnowledgeItem(term, linkableTerms)
    const titleText = extractTitleText(term.title)
    const keyText = extractKey(renderedTerm)
    
    // Keep the HTML content but ensure it's properly escaped
    glossaryData[keyText] = {
      title: titleText,
      text: escapeHtmlEntities(renderedTerm.text) + '\n'
    }
  }
  
  // Return compact JSON format
  return JSON.stringify(glossaryData)
}

// Render glossary as pure Markdown
function renderGlossaryAsMarkdown(
  terms: Definition[], 
  linkableTerms: LinkableTerms
): string {
  const items = terms.map(term => {
    const renderedTerm = renderKnowledgeItem(term, linkableTerms)
    const markdownText = htmlToMarkdown(renderedTerm.text)
    const titleText = extractTitleText(term.title)
    const keyText = extractKey(renderedTerm)
    
    return `### ${titleText} {#${keyText}}\n\n${markdownText}`
  })
  
  return '\n\n' + items.join('\n\n') + '\n'
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
  
  // Use our custom glossary JSON renderer with proper HTML escaping
  const glossaryJSON = renderGlossaryJSONWithEscaping(validGlossaryTerms, linkableTerms)
  fs.writeFileSync('static/glossary.json', glossaryJSON)
  
  // Generate glossary partial as pure Markdown
  const glossaryMarkdown = renderGlossaryAsMarkdown(validGlossaryTerms, linkableTerms)
  fs.writeFileSync('docs/partials/_glossary-partial.mdx', glossaryMarkdown)

  // FAQs
  // ----
  // Get started
  fs.writeFileSync(
    'static/get-started-faqs.json',
    renderJSONFAQStructuredData(cmsContents.getStartedFAQs)
  )
  fs.writeFileSync(
    'docs/partials/_troubleshooting-users-partial.mdx',
    renderFAQs(cmsContents.getStartedFAQs)
  )

  // Node running
  fs.writeFileSync(
    'static/node-running-faqs.json',
    renderJSONFAQStructuredData(cmsContents.nodeRunningFAQs)
  )
  fs.writeFileSync(
    'docs/partials/_troubleshooting-nodes-partial.mdx',
    renderFAQs(cmsContents.nodeRunningFAQs)
  )

  // Building
  fs.writeFileSync(
    'static/building-faqs.json',
    renderJSONFAQStructuredData(cmsContents.buildingFAQs)
  )
  fs.writeFileSync(
    'docs/partials/_troubleshooting-building-partial.mdx',
    renderFAQs(cmsContents.buildingFAQs)
  )

  // Stylus
  fs.writeFileSync(
    'static/building-stylus-faqs.json',
    renderJSONFAQStructuredData(cmsContents.buildingStylusFAQs)
  )
  fs.writeFileSync(
    'docs/partials/_troubleshooting-stylus-partial.mdx',
    renderFAQs(cmsContents.buildingStylusFAQs)
  )

  // Orbit
  fs.writeFileSync(
    'static/building-orbit-faqs.json',
    renderJSONFAQStructuredData(cmsContents.orbitFAQs)
  )
  fs.writeFileSync(
    'docs/partials/_troubleshooting-arbitrum-chain-partial.mdx',
    renderFAQs(cmsContents.orbitFAQs)
  )

  // Bridging
  fs.writeFileSync(
    'static/bridging-faqs.json',
    renderJSONFAQStructuredData(cmsContents.bridgingFAQs)
  )
  fs.writeFileSync(
    'docs/partials/_troubleshooting-bridging-partial.mdx',
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
