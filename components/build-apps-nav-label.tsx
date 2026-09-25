'use client';

import { usePathname } from 'next/navigation';

const buildAppsSections = [
  '/docs/build-decentralized-apps',
  '/docs/stylus',
  '/docs/arbitrum-essentials',
];

export function BuildAppsNavLabel() {
  const pathname = usePathname();
  const active = buildAppsSections.some(
    (section) => pathname === section || pathname.startsWith(`${section}/`),
  );

  return <span data-active={active}>Build apps</span>;
}
