import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { appName } from '@/lib/shared';

/** One homepage-inspired social card for the homepage and every documentation page. */
export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = 'image/png';

// Satori cannot reproduce the hero's color-dodge blend or read WOFF2. The background is captured
// from HomeHero by scripts/generate-og-background.ts; Aeonik is the same face in OTF format.
// Local reads also keep prerendering independent of the site's deployed URL and external hosts.
function readOgAssets() {
  return Promise.all([
    readFile(path.join(process.cwd(), 'public/img/og-hero-background.jpg')),
    readFile(path.join(process.cwd(), 'public/img/logo.svg')),
    readFile(path.join(process.cwd(), 'public/fonts/fk-screamer-upright.otf')),
    readFile(path.join(process.cwd(), 'public/fonts/aeonik-regular.otf')),
  ]);
}
let assets: ReturnType<typeof readOgAssets> | undefined;

export async function renderOgImage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const [background, logo, displayFont, bodyFont] = await (assets ??= readOgAssets());
  const fontSize = title.length > 120 ? 64 : title.length > 80 ? 80 : 104;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#05163d',
        color: 'white',
        fontFamily: 'Aeonik',
      }}
    >
      <img
        src={`data:image/jpeg;base64,${background.toString('base64')}`}
        alt=""
        width={1200}
        height={630}
        style={{ position: 'absolute', inset: 0 }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '48px 64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28 }}>
          <img
            src={`data:image/svg+xml;base64,${logo.toString('base64')}`}
            alt=""
            width={32}
            height={36}
          />
          {appName}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontFamily: 'FK Screamer',
              fontSize,
              lineHeight: 0.92,
              textTransform: 'uppercase',
              textWrap: 'balance',
            }}
          >
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 26, lineHeight: 1.3, maxWidth: 960 }}>{description}</div>
          )}
        </div>
        <div style={{ display: 'flex', color: '#10e1ff', fontSize: 22 }}>docs.arbitrum.io</div>
      </div>
    </div>,
    {
      ...ogImageSize,
      fonts: [
        { name: 'FK Screamer', data: displayFont, weight: 400, style: 'normal' },
        { name: 'Aeonik', data: bodyFont, weight: 400, style: 'normal' },
      ],
    },
  );
}
