---
name: "source-command-sync-sme-status"
description: "Migrated source command `sync-sme-status`"
---

# source-command-sync-sme-status

Use this skill when the user asks to run the migrated source command `sync-sme-status`.

## Command Template

This legacy integration is retained for contributor-local setups. Before running it, verify
that the contributor's checkout has `scripts/update-sme-status.js` and the required Notion
tools. That script is absent from this repository; report the missing integration rather than
running the template or changing Notion data when its prerequisites are unavailable.

Sync SME review statuses from GitHub to the Notion PR tracking table.

Steps:
1. Fetch the Notion page `21e01a3f-59f8-80cd-987f-c346c0b283db` using the Notion MCP (`notion-fetch` tool)
2. Extract all PR numbers from the table rows (match `/pull/(\d+)` in the URL column)
3. Run `node scripts/update-sme-status.js <pr-numbers>` to fetch GitHub review statuses
4. Compare the JSON output against the current Notion statuses
5. For any rows where the status differs, update the Notion table using `notion-update-page` with `replace_content_range`
6. Report a summary of changes made
