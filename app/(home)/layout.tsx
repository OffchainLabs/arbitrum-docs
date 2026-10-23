import { HomeLayout as BaseHomeLayout } from 'fumadocs-ui/layouts/home';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { HomeHeader } from '@/components/home-header';
import { baseOptions } from '@/lib/layout.shared';

// `NEXT_PUBLIC_*` is inlined at build time, so this is a constant per build.
const HomeLayout =
  process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === 'true'
    ? dynamic(() => import('@/components/ai/layout').then((m) => m.HomeLayout))
    : BaseHomeLayout;

export default function Layout({ children }: { children: ReactNode }) {
  // HomeHeader gives the landing page the same navbar as the docs pages.
  return (
    <HomeLayout {...baseOptions()} slots={{ header: HomeHeader }}>
      {children}
    </HomeLayout>
  );
}
