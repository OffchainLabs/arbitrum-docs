import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

import { HomeHeader } from '@/components/home-header';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  // HomeHeader gives the landing page the same navbar as the docs pages.
  return (
    <HomeLayout {...baseOptions()} slots={{ header: HomeHeader }}>
      {children}
    </HomeLayout>
  );
}
