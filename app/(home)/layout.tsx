import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

import { HomeHeader } from '@/components/home-header';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  // The home layout's own navbar opens `type: 'menu'` links as a page-wide mega menu; the docs
  // pages use the notebook header's small popover. HomeHeader renders the notebook look here so
  // the landing page and every docs page share one navbar. See components/home-header.tsx.
  return (
    <HomeLayout {...baseOptions()} slots={{ header: HomeHeader }}>
      {children}
    </HomeLayout>
  );
}
