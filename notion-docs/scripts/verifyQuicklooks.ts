const fs = require('fs')
const glob = require('glob')
const quicklookKeysJSON = require('../../static/glossary.json')

const QUICKLOOKS_PREFIX = 'data-quicklook-from='

function findQuotedTextAfter(string: string, input: string) {
  const regex = new RegExp(`${string}[\\s]*(['"])(.*?)\\1`, 'g')
  const matches: string[] = []
  let match
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[2])
  }
  return matches
}

glob('../../docs/**/*', function (err: any, res: any) {
  if (err) {
    throw new Error(err)
  } else {
    let quicklookKeys: string[] = []
    for (const path of res) {
      if (!(path.endsWith('.md') || path.endsWith('.mdx'))) continue
      const data: string = fs.readFileSync(path, 'utf8')
      quicklookKeys = quicklookKeys.concat(
        findQuotedTextAfter(QUICKLOOKS_PREFIX, data)
      )
    }
    const notFoundKeys = quicklookKeys.filter(key => !quicklookKeysJSON[key])
    if (notFoundKeys.length === 0) {
      console.log('Quicklooks verification successful')
      process.exit(0)
    } else {
      console.log(
        `Quicklooks verification failed: the following keys not found in glossary:\n${notFoundKeys.join(
          '\n'
        )}`
      )
      process.exit(1)
    }
  }
})
