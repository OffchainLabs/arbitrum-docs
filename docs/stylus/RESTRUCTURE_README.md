# Stylus Documentation Restructure - Complete Guide

This directory contains comprehensive, executable guides for restructuring the Stylus documentation.

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Master guide with overview and Phases 1-2
- **[IMPLEMENTATION_GUIDE_PHASE3.md](./IMPLEMENTATION_GUIDE_PHASE3.md)** - Phase 3: Content Consolidation
- **[IMPLEMENTATION_GUIDE_PHASE4.md](./IMPLEMENTATION_GUIDE_PHASE4.md)** - Phase 4: Create New Content
- **[IMPLEMENTATION_GUIDE_PHASE5.md](./IMPLEMENTATION_GUIDE_PHASE5.md)** - Phase 5: Expansion & Validation

## 🎯 Quick Start

```bash
# 1. Create backup
git checkout -b stylus-docs-restructure
git add -A
git commit -m "checkpoint: before restructure"

# 2. Execute phases in order
# See IMPLEMENTATION_GUIDE.md for detailed steps

# 3. Validate after each phase
yarn build
```

## 📊 Overview

| Phase | Focus | Duration | Files | Diagrams |
|-------|-------|----------|-------|----------|
| **1** | Foundation & Compliance | ~8h | ~28 modified | 3 added |
| **2** | Directory Restructure | ~10h | ~20 modified | 0 |
| **3** | Content Consolidation | ~12h | 4 modified, 12 new | 1 added |
| **4** | Create New Content | ~16h | 15 new | 6 added |
| **5** | Expansion & Validation | ~12h | ~18 modified | 3 added |
| **Total** | **5 weeks** | **~58h** | **~100 files** | **13 diagrams** |

## 🗺️ Restructure Roadmap

### Phase 1: Foundation & Compliance
- [x] Delete duplicate files
- [x] Create missing configs
- [x] Fix terminology violations
- [x] Complete frontmatter
- [x] Merge verification docs
- [x] Add quick-win diagrams (#3, #8, #12)

**Success Criteria:** 100% terminology compliance, complete frontmatter, 3 diagrams rendering

### Phase 2: Directory Restructure
- [ ] Create 5 new top-level directories
- [ ] Move files to fundamentals/
- [ ] Rename how-tos/ to guides/
- [ ] Create cli-tools/ section
- [ ] Update sidebars.js
- [ ] Fix all imports

**Success Criteria:** Flatter structure (max 3 levels), all files moved, no broken links

### Phase 3: Content Consolidation
- [ ] Merge VM differences
- [ ] Split rust-sdk-guide.md into 8 files
- [ ] Extract setup to partials
- [ ] Streamline quickstart
- [ ] Add journey diagram (#13)

**Success Criteria:** No duplicate content, SDK properly organized, partials working

### Phase 4: Create New Content
- [ ] Add fundamentals content (choose-path, dev-env)
- [ ] Create interop guides (Rust ↔ Solidity)
- [ ] Write best practices (security, performance, gas)
- [ ] Build troubleshooting section
- [ ] Add core concept diagrams (#1, #2, #4, #5, #6, #9)

**Success Criteria:** All gaps filled, 6 diagrams added, comprehensive coverage

### Phase 5: Expansion & Validation
- [ ] Expand all stub files
- [ ] Configure redirects
- [ ] Add polish diagrams (#7, #10, #11)
- [ ] Run comprehensive validation
- [ ] Achieve ≥95% accessibility

**Success Criteria:** All stubs expanded, all 13 diagrams working, 100% compliance, ≥95% accessibility

## 📁 New Directory Structure

```
docs/stylus/
├── gentle-introduction.mdx
├── quickstart.mdx
│
├── fundamentals/                    # NEW: SDK basics + prerequisites
│   ├── prerequisites.mdx
│   ├── choose-your-path.mdx         # NEW
│   ├── development-environment.mdx  # NEW
│   ├── project-structure.mdx        # MOVED from reference/
│   ├── contracts.mdx                # MOVED + EXPANDED
│   ├── global-variables-and-functions.mdx  # MOVED + EXPANDED
│   ├── testing-contracts.mdx        # MOVED from how-tos/
│   └── data-types/                  # MOVED from reference/
│
├── guides/                          # RENAMED from how-tos, flattened
│   ├── create-project.mdx           # NEW
│   ├── using-constructors.mdx
│   ├── using-inheritance.mdx
│   ├── importing-interfaces.mdx
│   ├── exporting-abi.mdx
│   ├── optimizing-binaries.mdx
│   ├── caching-contracts.mdx
│   ├── call-solidity-from-rust.mdx  # NEW
│   ├── call-rust-from-solidity.mdx  # NEW
│   ├── deploy-non-rust-contracts.mdx
│   └── add-language-support.mdx
│
├── cli-tools/                       # NEW: Top-level CLI section
│   ├── overview.mdx
│   ├── check-and-deploy.mdx
│   ├── verify-contracts.mdx         # MERGED
│   ├── debugging-tx.mdx
│   └── commands-reference.mdx       # NEW
│
├── concepts/
│   ├── webassembly.mdx
│   ├── activation.mdx
│   ├── gas-metering.mdx
│   ├── vm-differences.mdx           # MERGED evm + solidity diffs
│   └── public-preview-expectations.mdx
│
├── best-practices/                  # NEW
│   ├── security.mdx                 # NEW
│   ├── performance.mdx              # NEW
│   └── gas-optimization.mdx         # NEW
│
├── advanced/
│   ├── rust-to-solidity-differences.mdx  # RENAMED
│   ├── minimal-entrypoint-contracts.mdx
│   ├── hostio-exports.mdx
│   ├── recommended-libraries.mdx
│   └── memory-management.mdx        # NEW
│
├── troubleshooting/                 # NEW
│   ├── faq.mdx
│   ├── common-errors.mdx            # NEW
│   └── debugging-guide.mdx          # NEW
│
├── reference/
│   ├── overview.mdx
│   ├── rust-sdk/                    # NEW: Split from rust-sdk-guide.md
│   │   ├── index.mdx
│   │   ├── storage.mdx
│   │   ├── methods.mdx
│   │   ├── events.mdx
│   │   ├── errors.mdx
│   │   ├── calls.mdx
│   │   ├── crypto.mdx
│   │   └── bytes-programming.mdx
│   └── opcode-hostio-pricing.mdx
│
└── partials/
    ├── _stylus-faucets.mdx          # MOVED
    ├── _setup-rust-toolchain.mdx    # NEW
    ├── _setup-cargo-stylus.mdx      # NEW
    └── _setup-docker-nitro.mdx      # NEW
```

## 🎨 Mermaid Diagrams

### High Priority (8 diagrams)

1. **Contract Lifecycle** (gentle-introduction.mdx) - Flowchart showing Coding → Activation → Execution → Proving
2. **Deployment & Activation** (activation.mdx) - Sequence diagram of two-step deployment
3. **WASM Processing Pipeline** (activation.mdx) - Flowchart of binary processing ✅ Phase 1
4. **EVM vs WASM Architecture** (vm-differences.mdx) - Side-by-side comparison
5. **Contract Call Flow** (importing-interfaces.mdx) - Sequence diagram for cross-language calls
6. **Ink to Gas Conversion** (gas-metering.mdx) - Flowchart explaining metering
7. **Storage Layout** (storage.mdx) - Memory layout diagram
8. **Call Config Decision Tree** (importing-interfaces.mdx) - Decision tree for Call constructors ✅ Phase 1

### Medium Priority (5 diagrams)

9. **Deployment Workflows** (check-and-deploy.mdx) - Swimlanes for dev/testnet/prod
10. **Memory Model** (webassembly.mdx) - WASM memory structure
11. **WASM Binary Structure** (webassembly.mdx) - Component diagram
12. **Storage Type Hierarchy** (storage.mdx) - Type hierarchy tree ✅ Phase 1
13. **Quickstart Journey** (quickstart.mdx) - Journey map ✅ Phase 3

## 🛠️ Scripts

All automation scripts are in `scripts/restructure/`:

```bash
scripts/restructure/
├── terminology-audit.sh        # Check CLAUDE.md compliance
├── frontmatter-audit.sh        # Verify frontmatter completion
├── update-imports.sh           # Fix imports for moved files
├── accessibility-audit.sh      # Check WCAG compliance
└── diagram-validation.sh       # Verify all diagrams present
```

## ✅ Validation Checklist

After each phase:

- [ ] Run `yarn build` successfully
- [ ] Zero broken links
- [ ] All diagrams render
- [ ] Terminology audit passes
- [ ] Frontmatter audit passes
- [ ] Git commit with descriptive message
- [ ] Tag phase completion

Final validation (Phase 5):

- [ ] Accessibility ≥95%
- [ ] Performance ≥90%
- [ ] Mobile responsive
- [ ] All 13 diagrams working
- [ ] 100% CLAUDE.md compliance
- [ ] Comprehensive redirects configured

## 🔄 Rollback Procedures

### Rollback Individual Phase

```bash
# Rollback to start of phase
git reset --hard phase-X-start

# Or revert specific phase
git revert phase-X-complete
```

### Rollback All Changes

```bash
# Reset to pre-restructure state
git reset --hard stylus-docs-restructure-start

# Or delete branch and start over
git checkout master
git branch -D stylus-docs-restructure
```

### Git Tags

Each phase creates two tags:
- `phase-X-start` - Before phase begins (for rollback)
- `phase-X-complete` - After phase commits (for reference)

## 📈 Success Metrics

### Content Quality
- ✅ Zero duplicate files
- ✅ Complete navigation (no orphans)
- ✅ Clear learning paths
- ✅ Focused files (<300 lines except references)
- ✅ Single source of truth

### CLAUDE.md Compliance
- ✅ 100% terminology standards
- ✅ 100% frontmatter completion
- ✅ Sentence case headers
- ✅ American English spelling
- ✅ Problem-solution troubleshooting format

### Architecture
- ✅ Flattened navigation (max 3 levels)
- ✅ Better categorization
- ✅ Testing as fundamental
- ✅ CLI as top-level section

### Technical Performance
- ✅ Improved SEO
- ✅ Faster page loads
- ✅ Accessibility ≥95%
- ✅ Mobile usability ≥90%

### Maintainability
- ✅ Clear conventions
- ✅ Zero broken links
- ✅ Comprehensive redirects
- ✅ Visual learning support (13 diagrams)

## 🤝 Contributing

When adding new content after restructure:

1. **Choose correct directory:**
   - SDK basics → `fundamentals/`
   - Practical guides → `guides/`
   - CLI commands → `cli-tools/`
   - Conceptual → `concepts/`
   - Patterns → `best-practices/`
   - Complex internals → `advanced/`
   - Problems → `troubleshooting/`
   - API reference → `reference/`

2. **Use complete frontmatter:**
   ```yaml
   ---
   title: 'Your title'
   description: 'SEO-friendly description'
   user_story: 'As a <role>, I want to <goal>'
   content_type: 'how-to | concept | reference | etc.'
   author: github-username
   sme: github-username
   sidebar_position: N
   ---
   ```

3. **Follow terminology standards:**
   - Run `./scripts/restructure/terminology-audit.sh`
   - Fix violations before committing

4. **Add diagrams for complex concepts:**
   - Use Mermaid for consistency
   - Include descriptive captions
   - Test in both light/dark themes

5. **Test before committing:**
   ```bash
   yarn build
   ./scripts/restructure/terminology-audit.sh
   ./scripts/restructure/frontmatter-audit.sh
   ```

## 📞 Support

Questions during implementation:

1. **Build errors:** Check `build.log` for specific errors
2. **Broken links:** Run `yarn build 2>&1 | grep broken`
3. **Import errors:** Run `./scripts/restructure/update-imports.sh`
4. **Diagram issues:** Run `./scripts/restructure/diagram-validation.sh`
5. **Rollback needed:** See rollback procedures above

## 📝 License

Same as parent project (MIT/Apache-2.0)

---

**Last Updated:** 2025-12-12
**Status:** Ready for implementation
**Estimated Total Time:** 5 weeks (~58 hours of focused work)
**Expected Impact:** Best-in-class documentation structure with comprehensive visual aids
