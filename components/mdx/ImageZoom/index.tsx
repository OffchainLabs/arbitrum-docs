'use client';

import { ImageZoom as FumaImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { ReactNode } from 'react';

import styles from './styles.module.css';

interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
  caption?: string;
  children?: ReactNode;
}

/**
 * Compatibility wrapper around Fumadocs's `<ImageZoom>` (from
 * `fumadocs-ui/components/image-zoom`, which uses `react-medium-image-zoom`).
 *
 * Why a wrapper instead of importing Fumadocs directly?
 *   - Fumadocs's default child is a Next.js `<Image>` which requires `width` and
 *     `height` props. Our legacy MDX usages don't pass those, so we provide a
 *     plain `<img>` child to bypass Next.js's image optimization while keeping
 *     the zoom interaction.
 *   - Preserves the legacy arbitrum-docs prop surface (`src`, `alt`, `className`,
 *     `caption`, `children`) so ported MDX doesn't need rewrites.
 *   - Adds the legacy figure + figcaption structure for layout/typography.
 */
export function ImageZoom({ src, alt = '', className, caption, children }: ImageZoomProps) {
  const captionText = children ?? caption;
  return (
    <figure className={styles.figure}>
      <FumaImageZoom>
        <img src={src} alt={alt} className={`${styles.thumbnail} ${className ?? ''}`.trim()} />
      </FumaImageZoom>
      {captionText && <figcaption className={styles.caption}>{captionText}</figcaption>}
    </figure>
  );
}
