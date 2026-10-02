'use client';

import { usePathname } from 'next/navigation';

const buildAppsSections = ['/build-decentralized-apps', '/stylus', '/arbitrum-essentials'];

export function BuildAppsNavLabel() {
  const pathname = usePathname();
  const active = buildAppsSections.some(
    (section) => pathname === section || pathname.startsWith(`${section}/`),
  );

  return <span data-active={active}>Build apps</span>;
}
