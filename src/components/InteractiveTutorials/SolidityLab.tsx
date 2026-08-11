import React from 'react';

import type { SolidityLabProps } from './SolidityLabSupport';
import { SolidityLabView } from './SolidityLabView';
import { useSolidityLab } from './useSolidityLab';

export type { SolidityLabProps, SolidityLabTask } from './SolidityLabSupport';

export function SolidityLab(props: SolidityLabProps) {
  return <SolidityLabView {...useSolidityLab(props)} />;
}
