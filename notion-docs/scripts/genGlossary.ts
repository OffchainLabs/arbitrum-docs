import { Client } from '@notionhq/client'
import {
  Definition,
  escapeForJSON,
  lookupProject,
  lookupGlossaryTerms,
  handleRenderError,
  renderGlossary,
  Record,
  renderGlossaryJSON,
  KnowledgeItem,
  LinkableTerms,
  LinkValidity,
  renderRichTexts,
  renderBlocks,
  formatAnchor,
  RenderMode,
  RenderKnowledgeItemError,
} from '@offchainlabs/notion-docs-generator'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

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
const getContentFromCMS = async (): Promise<Definition[]> => {
  const devDocsV2Project = await lookupProject(
    notion,
    'Arbitrum developer docs portal v2.0'
  )

  return lookupGlossaryTerms(notion, {
    filter: {
      property: 'Project(s)',
      relation: {
        contains: devDocsV2Project,
      },
    },
  })
}

export function renderKnowledgeItem(
  item: KnowledgeItem,
  linkableTerms: LinkableTerms
): {md: string, key: string} {
  try {
    const title = renderRichTexts(
      item.title,
      linkableTerms,
      RenderMode.Markdown
    )
    const titleforSort = renderRichTexts(
      item.title,
      linkableTerms,
      RenderMode.Plain
    )
    const dashDelimitedKey = formatAnchor(item.title, linkableTerms)

    let renderedText = renderBlocks(item.blocks, linkableTerms)
    if (renderedText.length == 0) {
      renderedText = renderRichTexts(
        item.text,
        linkableTerms,
        RenderMode.Markdown
      )
    }
    return {md:`---
title: ${title}
key: ${dashDelimitedKey}
titleforSort: ${titleforSort}
---
${renderedText}
`, key: dashDelimitedKey}
  } catch (e) {
    throw new RenderKnowledgeItemError(item, e)
  }
}

async function generateFiles() {
  const linkableTerms: LinkableTerms = {}

  // Getting content from the CMS
  const glossaryTerms = await getContentFromCMS()

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

  const validGlossaryTerms = glossaryTerms.filter(isValid)
  addItems(validGlossaryTerms, '/intro/glossary')
  for (const item of validGlossaryTerms) {
    let {md, key} = renderKnowledgeItem(item, linkableTerms)
    fs.writeFileSync(
      `../arbitrum-docs/partials/glossary/_${key}.mdx`,
      md
    )
  }
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
