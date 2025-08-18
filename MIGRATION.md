# Docusaurus to Fumadocs Migration Guide

This document outlines the complete process for migrating documentation sections from the old Docusaurus structure to the new Fumadocs framework.

## Overview

The migration involves converting documentation from the `docs/` directory structure (Docusaurus) to the `content/docs/` structure (Fumadocs) while ensuring all navigation, components, and content work correctly.

## Migration Process

### Phase 1: Content Migration

#### 1. Copy MDX Files from Master Branch
```bash
# Copy all MDX files from the section in master branch
# Example for how-arbitrum-works section:
git checkout master
cp -r docs/how-arbitrum-works/ /path/to/fumadocs/content/docs/
git checkout your-branch
```

#### 2. Create Navigation Structure
Create `meta.json` files for navigation at each directory level:

**Main section meta.json** (`content/docs/section-name/meta.json`):
```json
{
  "title": "Section Title",
  "pages": [
    "01-first-page",
    "02-second-page", 
    "subsection-folder",
    "03-third-page"
  ]
}
```

**Subsection meta.json** (`content/docs/section-name/subsection/meta.json`):
```json
{
  "title": "Subsection Title", 
  "pages": [
    "01-sub-page",
    "02-another-sub-page"
  ]
}
```

#### 3. Update Main Navigation
Add the new section to `content/docs/meta.json`:
```json
{
  "title": "Arbitrum Documentation",
  "pages": [
    "build-decentralized-apps",
    "how-arbitrum-works",  // <- Add new section
    "sdk"
  ]
}
```

### Phase 2: Fix Frontmatter Issues

#### Common Issues:
1. **Missing title field**: All MDX files need a `title` field in frontmatter
2. **Invalid frontmatter**: Partial files may lack proper frontmatter

#### Solutions:
```bash
# Find files with missing frontmatter
find content/docs/section-name -name "*.mdx" -exec head -5 {} \; -exec echo "=== FILE: {} ===" \;

# Add missing frontmatter to partial files
# Example fix:
---
title: Component Name
---
```

### Phase 3: Remove Old Import Statements

#### Find all problematic imports:
```bash
grep -r "import.*@site/src/components" content/docs/section-name/
```

#### Common imports to remove:
- `import ImageZoom from '@site/src/components/ImageZoom';`
- `import { VanillaAdmonition } from '@site/src/components/VanillaAdmonition/';`
- `import ImageWithCaption from '@site/src/components/ImageCaptions/';`
- `import { AddressExplorerLink as AEL } from '@site/src/components/AddressExplorerLink';`

**Solution**: Remove all these import statements since components are now globally available.

### Phase 4: Fix MDX Syntax Errors

#### 1. LaTeX Math Expressions
**Problem**: `$variable$` and `$$formula$$` syntax causes parsing errors
**Solution**: Convert to code blocks or inline code:
```markdown
# Before
$(U_{\text{upd}})$

# After  
`U_upd`
```

#### 2. HTML Comments
**Problem**: `<!-- comment -->` syntax not supported in MDX
**Solution**: Convert to JSX comments:
```markdown
# Before
<!-- comment -->

# After
{/* comment */}
```

#### 3. Table Syntax Errors
**Problem**: Missing closing pipes in markdown tables
**Solution**: Ensure all table rows end with `|`

#### 4. Info Callouts with Special Characters
**Problem**: Special characters in callout titles cause parsing errors
**Solution**: Simplify titles or use proper escaping

### Phase 5: Component Management

#### Required Components for Global MDX Usage

1. **Create missing components** in `components/ui/`:
   - `image-with-caption.tsx`
   - `image-zoom.tsx` 
   - `flow-chart.tsx`

2. **Update MDX components configuration** in `mdx-components.tsx`:
```tsx
import { ImageWithCaption } from './components/ui/image-with-caption';
import { ImageZoom } from './components/ui/image-zoom';
import { AddressExplorerLink } from './components/web3/AddressExplorerLink';
import { FlowChart } from './components/ui/flow-chart';

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // ... other components
    ImageWithCaption,
    ImageZoom,
    AddressExplorerLink,
    AEL: AddressExplorerLink, // Alias
    FlowChart,
    ...components,
  };
}
```

#### Component Templates

**ImageWithCaption component**:
```tsx
interface ImageWithCaptionProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageWithCaption({ 
  src, 
  alt = '', 
  caption, 
  width, 
  height, 
  className 
}: ImageWithCaptionProps) {
  return (
    <figure className={`my-4 ${className || ''}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="max-w-full h-auto rounded-lg"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

### Phase 6: Build and Test

#### 1. Test Development Server
```bash
npm run dev
```

#### 2. Test Production Build
```bash
npm run build
```

#### 3. Verify Navigation
- Check sidebar navigation works
- Verify all pages load without errors
- Test subsection expansion/collapse

#### 4. Clear Cache When Needed
```bash
rm -rf .next && npm run dev
```

## Common Issues and Solutions

### Issue: Component Not Defined Error
**Error**: `Expected component 'ComponentName' to be defined`
**Solution**: 
1. Ensure component is properly exported
2. Add to MDX components configuration  
3. Restart dev server
4. If using complex props, simplify or convert to standard markdown

### Issue: Frontmatter Validation Errors
**Error**: `invalid frontmatter - title: Invalid input: expected string, received undefined`
**Solution**: Add proper frontmatter to all MDX files:
```yaml
---
title: Page Title
---
```

### Issue: Build Failures
**Common causes**:
1. MDX syntax errors (LaTeX, HTML comments)
2. Missing component imports
3. Table syntax issues
4. Special characters in callouts

**Solution**: Check build output, fix syntax issues one by one

## Migration Checklist

### Pre-Migration
- [ ] Identify source directory in master branch
- [ ] Plan navigation structure
- [ ] Check for special components used

### Content Migration  
- [ ] Copy all MDX files from master
- [ ] Create all meta.json files
- [ ] Update main navigation
- [ ] Verify file structure matches plan

### Cleanup Phase
- [ ] Fix all frontmatter issues
- [ ] Remove old import statements
- [ ] Fix MDX syntax errors
- [ ] Handle component dependencies

### Component Phase
- [ ] Create missing components
- [ ] Update MDX components config
- [ ] Test component rendering

### Testing Phase
- [ ] Test dev server
- [ ] Test production build  
- [ ] Verify navigation works
- [ ] Test all pages load
- [ ] Take screenshots for documentation

### Final Verification
- [ ] All pages accessible via navigation
- [ ] No console errors
- [ ] Build passes without errors
- [ ] Components render correctly

## Files Created/Modified Per Section

### Directory Structure
```
content/docs/section-name/
├── meta.json                          # Main navigation
├── 01-page1.mdx                      # Individual pages
├── 02-page2.mdx
├── subsection1/
│   ├── meta.json                      # Subsection navigation
│   ├── 01-subpage.mdx
│   └── 02-subpage.mdx
└── subsection2/
    ├── meta.json
    └── pages...
```

### Modified Files
- `content/docs/meta.json` - Add section to main nav
- `mdx-components.tsx` - Add any new components
- `components/ui/` - Create missing components

## Success Metrics

A successful migration should have:
1. ✅ All pages accessible via sidebar navigation
2. ✅ No build errors or console errors  
3. ✅ Proper component rendering
4. ✅ Working table of contents
5. ✅ Responsive design maintained
6. ✅ All content displays correctly

## Post-Migration

After successful migration:
1. Document any section-specific issues
2. Update this guide with new patterns
3. Test cross-links between sections
4. Verify image assets are accessible
5. Consider adding missing image assets

---

*This guide was created during the migration of the `how-arbitrum-works` section and should be updated as new patterns emerge.*