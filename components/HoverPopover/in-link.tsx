'use client';

import { type ReactNode, createContext, useContext } from 'react';

const InLinkContext = createContext(false);

/** Marks its subtree as the content of a link, so a `HoverPopover` inside it renders no button. */
export function InLink({ children }: { children: ReactNode }) {
  return <InLinkContext value>{children}</InLinkContext>;
}

export function useInLink(): boolean {
  return useContext(InLinkContext);
}
