import { Client } from '@notionhq/client'
import {
  lookupProject,
  lookupGlossaryTerms,
  lookupFAQs,
  handleRenderError,
  renderGlossary,
  renderSimpleFAQs,
  Record,
  renderGlossaryJSON,
  KnowledgeItem,
  LinkableTerms,
  LinkValidity,
} from '@offchainlabs/notion-docs-generator'

import fs from 'fs'

import dotenv from 'dotenv'
dotenv.config()

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

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

async function generateFiles() {
  const linkableTerms: LinkableTerms = {}

  const devDocsV2Project = await lookupProject(
    notion,
    'Arbitrum developer docs portal v2.0'
  )

  const _definitions = await lookupGlossaryTerms(notion, {
    filter: {
      property: 'Project(s)',
      relation: {
        contains: devDocsV2Project,
      },
    },
  })
  const validDefs = _definitions.filter(isValid)

  const getStartedFAQ = await lookupFAQs(notion, {
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

  const nodeFAQ = await lookupFAQs(notion, {
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

  const buildFAQ = await lookupFAQs(notion, {
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

  const bridgeFAQ = await lookupFAQs(notion, {
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
  console.log('Rendering contents')

  addItems(validDefs, '/intro/glossary')
  const glossaryJSON = renderGlossaryJSON(validDefs, linkableTerms)
  fs.writeFileSync('../website/static/glossary.json', glossaryJSON)

  const definitionsHTML = `\n\n${renderGlossary(validDefs, linkableTerms)}\n`
  fs.writeFileSync(
    '../arbitrum-docs/partials/_glossary-partial.md',
    definitionsHTML
  )

  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-users-partial.md',
    renderSimpleFAQs(getStartedFAQ.filter(isValid), linkableTerms)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-nodes-partial.md',
    renderSimpleFAQs(nodeFAQ.filter(isValid), linkableTerms)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-building-partial.md',
    renderSimpleFAQs(buildFAQ.filter(isValid), linkableTerms)
  )
  fs.writeFileSync(
    '../arbitrum-docs/partials/_troubleshooting-bridging-partial.md',
    renderSimpleFAQs(bridgeFAQ.filter(isValid), linkableTerms)
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
