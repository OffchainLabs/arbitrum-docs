import Image from 'next/image';
import Link from 'next/link';

import { docsRoute } from '@/lib/shared';

/**
 * Home page hero, ported from arbitrum-website `components/homepage/hero/hero.tsx` (`<Hero>`,
 * the `#scene-1` panel) and then compacted for a docs landing page.
 *
 * Same layering as the site, bottom to top: a rounded panel on the `blue-dark-blue` gradient; the
 * `xerox_scan.webp` texture in `color-dodge` blend; seven navy diagonal slashes as an SVG; then the
 * copy. On the site GSAP reveals each slash left-to-right with a clip-path tween over ~4s. Here the
 * slashes are static in their revealed state: no GSAP dependency, no client component, and a hero
 * that reads the same on the second visit as on the first.
 *
 * Where it departs from the site, and why: the site's hero fills the viewport, which on a docs
 * landing page pushed the card grid below the fold. This one has no fixed height. From `lg` the
 * heading sits left and the copy and buttons right, so the panel is as tall as two lines of
 * display type and no more; below `lg` it stacks. The heading keeps the site's face (FK Screamer,
 * `font-display`), uppercase, cyan tail, two steps smaller than the site's. The SVG uses
 * `preserveAspectRatio="slice"` instead of the site's default `meet` because a wide, short panel
 * would otherwise show the slashes only in a centred band.
 *
 * Buttons are the site's own hero buttons (black pill, cyan text and glow on hover, no arrow),
 * not `BrandButton`: the site uses a different button in this one place, so the docs do too.
 */

/** The seven `.hero-path` slashes, verbatim from the site's SVG (viewBox 1401x760). */
const slashes = [
  'M1127.83 -899.985L1078.63 -1016.77L540.815 553.942L-681.57 31.322L-637.264 135.165L539.676 568.559L1127.83 -899.964V-899.985Z',
  'M538.536 584.339L-592.514 239.917L-547.956 344.31L537.029 604.033L1224.65 -670.364L1176.75 -784.043L538.536 584.339Z',
  'M-503.438 448.637L-456.543 558.509L534.036 642.615L1314.82 -456.291L1273.76 -553.746L535.774 619.812C302.866 581.249 -503.438 448.637 -503.438 448.637Z',
  'M1371.67 -321.311L532.323 664.678L-416.673 652.579L-370.841 760.144L530.507 688.053L1419.94 -206.764L1371.67 -321.311Z',
  'M1468.35 -91.8551L528.823 710.161L-326.809 862.594L-282.464 966.5L526.331 742.335L1519.03 28.4238L1468.33 -91.8975L1468.35 -91.8551Z',
  'M-237.269 1069.94C-225.873 1097.33 -193.464 1171.84 -193.464 1171.84L521.058 811.211L1615.2 256.67L1566.43 141.087L524.033 772.542L-237.211 1069.92L-237.269 1069.96V1069.94Z',
  'M1712.48 487.52C1701.49 461.121 1664.62 372.487 1664.62 372.487L518.122 849.416L-149.661 1278.47L-105.49 1380.94L514.471 897.222L1712.58 487.541L1712.5 487.478L1712.48 487.52Z',
];

const heroButtonClass =
  'flex h-10 items-center justify-center rounded-3xl bg-black px-6 text-sm text-white transition duration-300 hover:text-arbitrum-cyan hover:shadow-button-glow sm:w-[200px] lg:text-base';

export function HomeHero() {
  const docs = (path: string) => `${docsRoute}${path}`;

  return (
    <div className="w-full px-5 pt-2">
      <section className="relative overflow-hidden rounded-[24px] bg-linear-to-b from-arbitrum-blue to-arbitrum-navy text-white">
        <div aria-hidden className="absolute inset-0 mix-blend-color-dodge">
          {/* This texture is the home page's Largest Contentful Paint element (measured), so it
              gets all three hints rather than the one `priority` used to stand for. Next 16
              deprecated `priority` in favour of `preload`, and `preload` alone emits the `<link>`
              with no priority hint, which is what Lighthouse's LCP discovery check kept failing on:
              the request was discoverable early but queued behind everything else. `preload` puts
              the link in the head, `fetchPriority` raises the request itself, and `loading="eager"`
              keeps it off the lazy path. Next's own image docs deviate from this and say to pick
              one: they list `loading` and `fetchPriority` under "when not to use" `preload`. All
              three are here deliberately, because `preload` alone emits the `<link>` without the
              `fetchPriority` attribute (confirmed in the built HTML for `/`) and that is the exact
              attribute the audit asks for. The combination raises nothing: `get-img-props.js`
              throws only for `preload` with `loading="lazy"` or with the deprecated `priority`.
              See INTERNALS.md "Page weight and what loads late". */}
          <Image
            src="/img/hero-xerox-scan.webp"
            alt=""
            fill
            sizes="100vw"
            preload
            fetchPriority="high"
            loading="eager"
            className="object-cover"
          />
        </div>
        <svg
          aria-hidden
          className="absolute top-0 left-0 h-full w-full"
          viewBox="0 0 1401 760"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {slashes.map((d) => (
            <path key={d.slice(0, 24)} d={d} fill="var(--color-arbitrum-navy)" />
          ))}
        </svg>

        {/* Same `max-w-5xl px-4` container as the card grid in app/(home)/page.tsx and the footer,
            so the heading and copy line up with the content below instead of hugging the panel
            edge on wide screens. The panel itself stays full width. */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-14">
          <h1 className="font-display text-5xl leading-[0.9] uppercase selection:bg-black selection:text-white md:text-6xl lg:text-7xl">
            Get started
            <span className="text-arbitrum-cyan selection:bg-black">
              <br />
              with Arbitrum
            </span>
          </h1>
          <div className="flex flex-col gap-6 lg:max-w-[520px]">
            <p className="leading-snug lg:text-lg">
              Arbitrum is the finance-native platform providing infrastructure for applications,
              tokenization, and dedicated chains. These docs explain the protocols, chains,
              services, and SDKs developers use to build on the Arbitrum platform.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Link
                href={docs('/build-decentralized-apps/quickstart-solidity-remix')}
                className={heroButtonClass}
              >
                Solidity quickstart
              </Link>
              <Link href={docs('/stylus/quickstart')} className={heroButtonClass}>
                Stylus quickstart
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
