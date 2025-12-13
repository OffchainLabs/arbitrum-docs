# Stylus Documentation Structure

This document provides a visual overview of the Stylus documentation structure after the v0.10 restructure.

```
docs/stylus/
│
├── gentle-introduction.mdx
├── quickstart.mdx
├── using-cli.mdx (legacy)
│
├── fundamentals/
│   ├── _category_.yml
│   ├── choose-your-path.mdx [NEW - Phase 4]
│   ├── prerequisites.mdx [Phase 3]
│   ├── project-structure.mdx
│   ├── contracts.mdx [DIAGRAM: Lifecycle]
│   ├── global-variables-and-functions.mdx
│   ├── testing-contracts.mdx
│   └── data-types/
│       ├── primitives.mdx
│       ├── compound-types.mdx
│       ├── storage.mdx [DIAGRAMS: Hierarchy + Layout]
│       └── conversions-between-types.mdx
│
├── guides/
│   ├── _category_.yml
│   ├── using-constructors.mdx
│   ├── using-inheritance.mdx
│   ├── importing-interfaces.mdx [DIAGRAM: Cross-Contract Calls]
│   ├── exporting-abi.mdx
│   ├── optimizing-binaries.mdx
│   ├── caching-contracts.mdx
│   ├── deploying-non-rust-wasm-contracts.mdx
│   └── adding-support-for-new-languages.mdx
│
├── cli-tools/
│   ├── _category_.yml
│   ├── overview.mdx
│   ├── check-and-deploy.mdx
│   ├── verify-contracts.mdx
│   ├── debugging-tx.mdx
│   └── commands-reference.mdx
│
├── best-practices/ [NEW - Phase 4]
│   ├── _category_.yml
│   ├── security.mdx (501 lines)
│   └── gas-optimization.mdx [DIAGRAM: Performance Comparison] (548 lines)
│
├── troubleshooting/ [NEW - Phase 4]
│   ├── _category_.yml
│   ├── common-issues.mdx (591 lines)
│   └── troubleshooting-building-stylus.md (legacy)
│
├── concepts/
│   ├── _category_.yml
│   ├── webassembly.mdx [DIAGRAMS: Pipeline + Binary + Memory]
│   ├── activation.mdx [DIAGRAM: Deployment]
│   ├── gas-metering.mdx
│   ├── vm-differences.mdx (renamed in Phase 3)
│   └── public-preview-expectations.mdx
│
├── advanced/
│   ├── _category_.yml
│   ├── rust-to-solidity-differences.mdx (renamed in Phase 3)
│   ├── minimal-entrypoint-contracts.mdx
│   ├── hostio-exports.mdx
│   └── recommended-libraries.mdx
│
├── reference/
│   ├── _category_.yml
│   ├── overview.mdx
│   ├── opcode-hostio-pricing.mdx
│   └── rust-sdk-guide.md
│
├── partials/ (Reusable Content)
│   ├── _setup-rust-toolchain.mdx
│   ├── _setup-cargo-stylus.mdx
│   ├── _setup-docker-nitro.mdx
│   ├── _stylus-faucets.mdx
│   ├── _stylus-no-multi-inheritance-banner-partial.mdx
│   └── _stylus-public-preview-banner-partial.md
│
└── planning/ (Phase Guides)
    ├── RESTRUCTURE_README.md
    ├── IMPLEMENTATION_GUIDE.md
    ├── IMPLEMENTATION_GUIDE_PHASE3.md
    ├── IMPLEMENTATION_GUIDE_PHASE4.md
    └── IMPLEMENTATION_GUIDE_PHASE5.md
```

## Statistics

### Diagrams: 11 total

| File                                | Diagrams | Description                                          |
| ----------------------------------- | -------- | ---------------------------------------------------- |
| fundamentals/choose-your-path.mdx   | 1        | Learning path decision tree                          |
| fundamentals/contracts.mdx          | 1        | Contract lifecycle flow                              |
| fundamentals/data-types/storage.mdx | 2        | Type hierarchy + Slot layout                         |
| guides/importing-interfaces.mdx     | 1        | Cross-contract calls                                 |
| best-practices/gas-optimization.mdx | 1        | Stylus vs Solidity performance                       |
| concepts/webassembly.mdx            | 3        | Execution pipeline + Binary structure + Memory model |
| concepts/activation.mdx             | 1        | WASM deployment process                              |
| quickstart.mdx                      | 1        | User journey through quickstart                      |

### Directory Structure

**10 top-level directories:**

- `fundamentals/` - Core concepts and data types
- `guides/` - How-to guides for common tasks
- `cli-tools/` - CLI commands and usage
- `best-practices/` [NEW] - Security and optimization
- `troubleshooting/` [NEW] - Common issues and solutions
- `concepts/` - Deep-dive conceptual explanations
- `advanced/` - Advanced topics and low-level details
- `reference/` - API reference and SDK documentation
- `partials/` - Reusable content snippets
- `planning/` - Restructure implementation guides

### File Inventory

**Total:** ~58 documentation files

**By Phase:**

- **Phase 2:** Moved 19 files, created new directory structure
- **Phase 3:** Created 4 new files (prerequisites + 3 partials)
- **Phase 4:** Created 4 major files (choose-your-path, security, gas-optimization, common-issues)
- **Phase 5:** Added 3 diagrams to existing files

**Major Content:**

- Phase 4 new content: ~1,925 lines across 4 files
- Comprehensive security guide: 501 lines
- Complete gas optimization guide: 548 lines
- Troubleshooting FAQ: 591 lines
- Learning path guide: 285 lines

### Navigation Improvements

- **Before:** 4+ levels deep (confusing hierarchy)
- **After:** Maximum 3 levels (clear, scannable structure)
- **Sidebar categories:** 9 main sections (down from 15+ scattered sections)

## Phase Highlights

### Phase 1: Planning

- Analyzed existing structure
- Identified pain points
- Created comprehensive restructure plan

### Phase 2: Directory Restructure

- Created 5 new top-level directories
- Moved 19 files to logical locations
- Flattened sidebar from 4+ to max 3 levels
- Updated 80+ navigation items

### Phase 3: Content Consolidation

- Created reusable setup partials (3 files)
- Renamed confusing files (evm->vm, solidity->rust-to-solidity)
- Added prerequisites guide
- Added journey diagram to quickstart
- Eliminated duplicate content

### Phase 4: New Content Creation

- Choose Your Path guide (4 learning paths)
- Security Best Practices (comprehensive)
- Gas Optimization Best Practices (Stylus-specific)
- Troubleshooting guide (common issues)
- 3 new diagrams added

### Phase 5: Final Polish

- Added 3 final diagrams (storage, WASM binary, memory)
- Completed comprehensive validation
- Verified all builds pass
- Tagged final milestone

## Annotations Used

| Marker    | Meaning                                 |
| --------- | --------------------------------------- |
| [NEW]     | Added during restructure                |
| [DIAGRAM] | Contains Mermaid diagram(s)             |
| (legacy)  | May be deprecated or consolidated       |
| [Phase N] | Indicates which phase added/modified it |

## Quick Navigation

### For New Developers

1. Start: `gentle-introduction.mdx`
2. Setup: `fundamentals/prerequisites.mdx`
3. Build: `quickstart.mdx`
4. Choose path: `fundamentals/choose-your-path.mdx`

### For Solidity Developers

1. Start: `advanced/rust-to-solidity-differences.mdx`
2. Quick start: `quickstart.mdx`
3. Best practices: `best-practices/security.mdx`

### For Rust Developers

1. Start: `quickstart.mdx`
2. Concepts: `concepts/webassembly.mdx`
3. Optimize: `best-practices/gas-optimization.mdx`

### When Stuck

1. Troubleshooting: `troubleshooting/common-issues.mdx`
2. CLI help: `cli-tools/commands-reference.mdx`
3. Debugging: `cli-tools/debugging-tx.mdx`

## Tags Available

Git tags for rollback if needed:

- `phase-1-complete` - Planning phase
- `phase-2-complete` - Directory restructure
- `phase-3-complete` - Content consolidation
- `phase-4-complete` - New content creation
- `phase-5-complete` - Final diagrams
- `stylus-v0-10-restructure-complete` - Final milestone

---

**Last Updated:** December 12, 2025
**Restructure Status:** Complete (All 5 phases)
**Total Diagrams:** 11
**Total Files:** ~58
**Navigation Depth:** Max 3 levels
